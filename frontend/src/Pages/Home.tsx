import ChannelVideos from "../Components/ChannelVideos";

const Home = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col mx-auto">
        <h1 className="text-2xl font-bold mx-auto">Youtube Parser</h1>
        <p className="text-gray-500 mx-auto">Welcome to Parser project</p>
      </div>
      <div className="mt-8">
        <ChannelVideos />
      </div>
    </div>
  );
};

export default Home;
