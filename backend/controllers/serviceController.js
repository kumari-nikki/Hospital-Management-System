import Service from "../models/Sevice.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
// Helper function
// so this function will converts array like input into a clean array
// when array is empty or invalid it will return empty array
const parseJsonArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === "string") {
        try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) return parsed;
            return typeof parsed === "string" ? [parsed] : [];
        } catch {
            return field
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
        }
    }
    return [];
};
// so this function takes date -time slot strings and group them into a YY-MM-DD with the time 
function normalizeSlotsToMap(slotStrings = []) {
    const map = {};
    slotStrings.forEach((raw) => {
        const m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!m) {
            // fallback: keep raw in an "unspecified" bucket
            map["unspecified"] = map["unspecified"] || [];
            map["unspecified"].push(raw);
            return;
        }
        const [, day, monShort, year, hour, minute, ampm] = m;
        const monthIdx = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            .findIndex(x => x.toLowerCase() === monShort.toLowerCase());
        const mm = String(monthIdx + 1).padStart(2, "0");
        const dd = String(Number(day)).padStart(2, "0");
        const dateKey = `${year}-${mm}-${dd}`; // YYYY-MM-DD
        const timeStr = `${String(Number(hour)).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm.toUpperCase()}`;
        map[dateKey] = map[dateKey] || [];
        map[dateKey].push(timeStr);
    });
    return map;
}
// it safely convert into number
const sanitizePrice = (v) => Number(String(v ?? "0").replace(/[^\d.-]/g, "")) || 0;
const parseAvailability = (v) => {
    const s = String(v ?? "available").toLowerCase();
    return s === "available" || s === "true";
};

// to create a service
export async function createService(req, res) {
    try {
        const b = req.body || {};
        const instructions = parseJsonArrayField(b.instructions);
        const rawSlots = parseJsonArrayField(b.slots);
        const slots = normalizeSlotsToMap(rawSlots);
        const numericPrice = sanitizePrice(b.price);
        const available = parseAvailability(b.availability);

        let imageUrl = null;
        let imagePublicId = null;
        if (req.file) {
            try {
                const up = await uploadToCloudinary(req.file.path, "services");
                imageUrl = up?.secure_url || null;
                imagePublicId = up?.public_id || null;
            } catch (err) {
                console.error("Cloudinary upload error:", err);
            }
        }// if the file is present it will be uploaded to service folder in the cloudinary
        const service = new Service({
            name: b.name,
            about: b.about || "",
            shortDescription: b.shortDescription || "",
            price: numericPrice,
            available,
            instructions,
            slots,
            imageUrl,
            imagePublicId
        });
        const saved = await service.save();
        return res.status(201).json({
            success: true,
            data: saved,
            message: "Service created"
        });
    }
    catch (error) {
        console.error("CreatedService Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

// to get all the services
export async function getServices(req, res) {
    try {
        const list = await Service.find().sort({ createdAt: -1 }).lean();
        return res.status(200).json({
            success: true,
            data: list
        });
    }
    catch (error) {
        console.error("GetService Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}
// to get service by id
export async function getServiceById(req, res) {
    try {
        const { id } = req.params;
        const service = await Service.findById(id).lean();
        if (!service) return res.status(404).json({
            successs: false,
            message: "Service not found"
        });

        return res.status(200).json({
            success: true,
            data: service
        });
    }
    catch (error) {
        console.error("GetServiceById Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

// to update a service
export async function updateService(req, res) {
    try {
        const { id } = req.params;
        const existing = await Service.findById(id);
        if (!existing) return res.status(404).json({
            success: false,
            message: "Service not found"
        });
        const b = req.body || {};
        const updateData = {};
        // to update each field if already present then update them
        if (b.name !== undefined) updateData.name = b.name;
        if (b.about !== undefined) updateData.about = b.about;
        if (b.shortDescription !== undefined) updateData.shortDescription = b.shortDescription;
        if (b.price !== undefined) updateData.price = sanitizePrice(b.price);
        if (b.availability !== undefined) updateData.available = parseAvailability(b.availability);
        if (b.instructions !== undefined) updateData.instructions = parseJsonArrayField(b.instructions);
        if (b.slots !== undefined) updateData.slots = normalizeSlotsToMap(parseJsonArrayField(b.slots));

        if (req.file) {
            try {
                const up = await uploadToCloudinary(req.file.path, "services");
                if (up?.secure_url) {
                    updateData.imageUrl = up.secure_url;
                    updateData.imagePublicId = up.public_id || null;
                    if (existing.imagePublicId) {
                        // it will remove the old image and will update the new image
                        try {
                            await deleteFromCloudinary(existing.imagePublicId);
                        } catch (err) {
                            console.warn("Cloudinary delete failed:", err?.message || err);
                        }
                    }
                }
            } catch (err) {
                console.error("Cloudinary upload error:", err);
            }
        }
        const updated = await Service.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        return res.status(200).json({
            success: true,
            data: updated,
            message: "Service updated"
        })
    }
    catch (error) {
        console.error("UpdateService Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

// to delete a service 
export async function deleteService(req, res) {
    try {
        const { id } = req.params;
        const existing = await Service.findById(id);
        if (!existing) return res.status(404).json({
            success: false,
            message: "Service not found"
        });
        if (existing.imagePublicId) {
            try {
                await deleteFromCloudinary(existing.imagePublicId);
            }
            catch (error) {
                console.warn("Failed to delete image from cloudinary",
                    error?.message || error

                );
            }
        }
        await existing.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Service Deleted."
        })
    }
    catch (error) {
        console.error("DeleteService Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}