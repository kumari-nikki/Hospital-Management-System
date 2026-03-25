import React, { useEffect, useRef, useState } from 'react';
import { navbarStyles } from '../assets/dummyStyles';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { SignedOut, SignedIn, UserButton, useClerk, SignOutButton } from '@clerk/clerk-react';
import logo from '../assets/logo.png';
import { User, Key, Menu, X } from 'lucide-react';
const STORAGE_KEY = "doctorToken_v1";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false); // mobile toggle
    const [showNavbar, setShowNavbar] = useState(true); // show/hide navbar on scroll
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
        try {
            return Boolean(localStorage.getItem(STORAGE_KEY));
        } catch {
            return false;
        }
    });

    const location = useLocation();
    const navRef = useRef(null);
    const clerk = useClerk();
    const navigate = useNavigate();
    //hide and show navbar if the current scroll is greater than 80 then hide the navbar
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);
//if doctor is loggged in it will stored inside the local storage
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY) {
                setIsDoctorLoggedIn(Boolean(e.newValue));
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);
// close the toggle menu for the mobile when click outside the box
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Doctors", href: "/doctors" },
        { label: "Services", href: "/services" },
        { label: "Appointments", href: "/appointments" },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <>
            {/* top border */}
            <div className={navbarStyles.navbarBorder}></div>

            <nav ref={navRef}
                className={`${navbarStyles.navbarContainer} ${showNavbar ? navbarStyles.navbarVisible : navbarStyles.navbarHidden
                    }`}
            >
                <div className={navbarStyles.contentWrapper}>
                    <div className={navbarStyles.flexContainer}>
                        {/* Logo */}
                        <Link to='/' className={navbarStyles.logoLink}>
                            <div className={navbarStyles.logoContainer}>
                                <div className={navbarStyles.logoImageWrapper}>
                                    <img src={logo} alt="logo" className={navbarStyles.logoImage} />
                                </div>
                            </div>
                            <div className={navbarStyles.logoTextContainer}>
                                <h1 className={navbarStyles.logoTitle}>MediCare</h1>
                                <p className={navbarStyles.logoSubtitle}>Healthcare Solutions</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className={navbarStyles.desktopNav}>
                            <div className={navbarStyles.navItemsContainer}>
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            to={item.href}
                                            className={`${navbarStyles.navItem} ${isActive
                                                ? navbarStyles.navItemActive
                                                : navbarStyles.navItemInactive
                                                }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right-side Buttons */}
                        <div className={navbarStyles.rightContainer}>
                            {/* When user is not signed in */}
                            <SignedOut>
                                {/* Doctor Admin login */}
                                <Link
                                    to='/doctor-admin/login'
                                    className={navbarStyles.doctorAdminButton}
                                >
                                    <User className={navbarStyles.doctorAdminIcon} />
                                    <span className={navbarStyles.doctorAdminText}>Doctor Admin</span>
                                </Link>

                                {/* Patient login */}
                                <button onClick={() => clerk.openSignIn()} className={navbarStyles.loginButton}>
                                    <Key className={navbarStyles.loginIcon} />
                                    Login
                                </button>
                            </SignedOut>

                            {/* When user is signed in */}
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>

                            {/* Mobile toggle */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={navbarStyles.mobileToggle}
                            >
                                {isOpen ? (
                                    <X className={navbarStyles.toggleIcon} />
                                ) : (
                                    <Menu className={navbarStyles.toggleIcon} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile navigation */}
                    {isOpen && (
                        <div className={navbarStyles.mobileMenu}>
                            {navItems.map((item, idx) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={idx} // use idx if href may not be unique
                                        to={item.href}
                                        onClick={() => setIsOpen(false)} // close menu when clicking an item
                                        className={`${navbarStyles.mobileMenuItem} ${isActive
                                            ? navbarStyles.mobileMenuItemActive
                                            : navbarStyles.mobileMenuItemInactive
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                            <SignedOut>
                                <Link to='/doctor-admin/login'
                                    className={navbarStyles.mobileDoctorAdminButton}
                                    onClick={() => setIsOpen(false)}>
                                    Doctor Admin
                                </Link>
                                <div className={navbarStyles.mobileLoginContainer}>
                                    <button onClick={() => {
                                        setIsOpen(false);
                                        clerk.openSignIn()
                                    }} className={navbarStyles.mobileLoginButton}>
                                        Login
                                    </button>

                                </div>
                            </SignedOut>
                        </div>
                    )}
                </div>
                <style>{navbarStyles.animationStyles}</style>
            </nav>
        </>
    );
};

export default Navbar;