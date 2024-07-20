import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Registering the required components for Chart.js
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
    setDetails([]); // Clearing the previous details

    try {
      const response = await axios.post("/api/extract-details", {
        image_url: data.imageUrl,
      });
      const fetchedDetails = JSON.parse(response.data.processed_text); // Parsing the JSON string to object

      // Checking if Time is an object with Time In and Time Out keys
      if (typeof fetchedDetails.Time === "object") {
        fetchedDetails[
          "Time"
        ] = `${fetchedDetails.Time["Time In"]} - ${fetchedDetails.Time["Time Out"]}`;
      }

      // Calculating the net weight
      if (
        fetchedDetails["Gross Weight"] &&
        fetchedDetails["Tare Weight"] === null
      ) {
        const grossWeight = parseFloat(fetchedDetails["Gross Weight"]);
        const netWeight = grossWeight; // Default to Gross Weight if Tare Weight is null
        fetchedDetails["Net Weight"] = `${netWeight} KG`;
      }

      setDetails([fetchedDetails]); // Setting details to the modified object
      setStatus("succeeded");
      toast.success("Image details fetched successfully!");

      // Save details to the database
      const saveDetails = {
        Date: fetchedDetails.Date,
        Time: fetchedDetails.Time,
        TicketNumber: fetchedDetails["Ticket Number"],
        IssuingCompany: fetchedDetails["Issuing Company"],
        TruckNumber: fetchedDetails["Truck Number"],
        WasteName: fetchedDetails["Waste Name"],
        GrossWeight: fetchedDetails["Gross Weight"],
        TareWeight: fetchedDetails["Tare Weight"],
        NetWeight: fetchedDetails["Net Weight"],
      };

      // Saving details to the database
      try {
        await axios.post("http://localhost:5000/api/save-details", saveDetails);
        toast.success("Image details saved successfully!");
      } catch (err) {
        setError("Failed to save image details to the database");
        toast.error("Failed to save image details to the database");
      }
    } catch (err) {
      setError("Failed to fetch image details");
      setStatus("failed");
      toast.error("Failed to fetch image details");
    }
  };

  // Preparing data for the chart
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      <div className="flex flex-col lg:flex-row items-center justify-between w-full mb-8 space-y-8 lg:space-y-0 lg:space-x-8">
        <div className="w-full lg:w-1/2 bg-white shadow-md p-6 rounded-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("imageUrl", {
                required: true,
                pattern: /(https?:\/\/.*\.(?:png|jpg))/i,
              })}
              className="border p-2 w-full rounded-md focus:ring-2 focus:ring-blue-400"
              placeholder="Enter image URL"
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-sm">Invalid URL</p>
            )}
            <div className="flex items-center justify-center">
              <button
                type="submit"
                className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
              >
                Get Details
              </button>
            </div>
          </form>
        </div>
        <div className="flex flex-col items-center w-full lg:w-1/2">
          {status === "loading" && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Fetched"
              className="w-[300px] h-64 mb-6 rounded-md shadow-md"
            />
          )}
        </div>
      </div>
      {details.length > 0 && (
        <div className="flex flex-col lg:flex-row justify-between items-start space-y-8 lg:space-y-0 lg:space-x-8">
          <div className="w-full lg:w-1/2 space-y-6">
            {details.map((detail, index) => (
              <div
                key={index}
                className="border border-gray-200 p-4 rounded-md shadow-md bg-white"
              >
                <div className="space-y-2">
                  <div className="flex">
                    <div className="w-1/3 font-bold">Date:</div>
                    <div className="w-2/3">{detail["Date"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Time:</div>
                    <div className="w-2/3">
                      {typeof detail["Time"] === "object"
                        ? `${detail["Time"]["Time In"]} - ${detail["Time"]["Time Out"]}`
                        : detail["Time"]}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Ticket Number:</div>
                    <div className="w-2/3">{detail["Ticket Number"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Issuing Company:</div>
                    <div className="w-2/3">{detail["Issuing Company"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Truck Number:</div>
                    <div className="w-2/3">{detail["Truck Number"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Waste Name:</div>
                    <div className="w-2/3">{detail["Waste Name"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Gross Weight:</div>
                    <div className="w-2/3">{detail["Gross Weight"]}</div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Tare Weight:</div>
                    <div className="w-2/3">
                      {detail["Tare Weight"] ?? "N/A"}
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 font-bold">Net Weight:</div>
                    <div className="w-2/3">
                      {detail["Net Weight"] ?? "Calculating..."}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-1/2 max-w-md bg-white p-6 rounded-md shadow-md">
            <Pie data={chartData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDetails;
