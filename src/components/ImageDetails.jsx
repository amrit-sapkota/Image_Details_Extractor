import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Register the required components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const ImageDetails = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [details, setDetails] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const onSubmit = async (data) => {
    setStatus("loading");
    setError(null);
    setImageUrl(data.imageUrl);

    try {
      const response = await axios.post("/api/extract-details", {
        image_url: data.imageUrl,
      });
      const fetchedDetails = JSON.parse(response.data.processed_text); // Parsing the JSON string to object

      // Calculating the net weight
      if (
        fetchedDetails["Gross Weight"] &&
        fetchedDetails["Tare Weight"] === null
      ) {
        const grossWeight = parseFloat(fetchedDetails["Gross Weight"]);
        const netWeight = grossWeight; // Default to Gross Weight if Tare Weight is null
        fetchedDetails["Net Weight"] = `${netWeight} KG`;
      }

      setDetails([fetchedDetails]); // Set details to the modified object
      setStatus("succeeded");
      toast.success("Image details fetched successfully!");
    } catch (err) {
      setError("Failed to fetch image details");
      setStatus("failed");
      toast.error("Failed to fetch image details");
    }
  };

  // Prepare data for the chart
  const chartData = {
    labels: details.map((detail) => detail["Waste Name"]),
    datasets: [
      {
        label: "Net Weight",
        data: details.map((detail) =>
          parseFloat(detail["Net Weight"].replace(" KG", ""))
        ),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
        <input
          {...register("imageUrl", {
            required: true,
            pattern: /(https?:\/\/.*\.(?:png|jpg))/i,
          })}
          className="border p-2 w-full"
          placeholder="Enter image URL"
        />
        {errors.imageUrl && <p className="text-red-500">Invalid URL</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
          Submit
        </button>
      </form>
      {status === "loading" && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {imageUrl && (
        <img src={imageUrl} alt="Fetched" className="w-full h-auto mb-6" />
      )}

      {details.length > 0 && (
        <div>
          <table className="w-full table-auto mb-6">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Ticket Number</th>
                <th>Issuing Company</th>
                <th>Truck Number</th>
                <th>Waste Name</th>
                <th>Gross Weight</th>
                <th>Tare Weight</th>
                <th>Net Weight</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <td>{detail["Date"]}</td>
                  <td>{detail["Time"]}</td>
                  <td>{detail["Ticket Number"]}</td>
                  <td>{detail["Issuing Company"]}</td>
                  <td>{detail["Truck Number"]}</td>
                  <td>{detail["Waste Name"]}</td>
                  <td>{detail["Gross Weight"]}</td>
                  <td>{detail["Tare Weight"] ?? "N/A"}</td>
                  <td>{detail["Net Weight"] ?? "Calculating..."}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="w-full max-w-md mx-auto">
            <Pie data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDetails;
