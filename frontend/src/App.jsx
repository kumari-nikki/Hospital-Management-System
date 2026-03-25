const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-6 w-80 text-center">
        
        <img
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500"
          src="https://i.pravatar.cc/150?img=3"
          alt="profile"
        />

        <h2 className="text-2xl font-bold text-gray-800">Nikki</h2>
        <p className="text-gray-500 mb-4">Frontend Developer</p>

        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Follow
        </button>
      </div>
    </div>
  );
};

export default App;