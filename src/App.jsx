import "./App.css";
import ImageDetails from "./components/ImageDetails";

const App = () => {
  return (
    <div className="App">
      <h1 className="text-center text-2xl font-bold p-6">
        Image Details Extractor
      </h1>
      <ImageDetails />
    </div>
  );
};

export default App;
