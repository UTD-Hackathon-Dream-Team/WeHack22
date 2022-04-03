import { Wrapper, Status } from "@googlemaps/react-wrapper";
import Map from "./Map";
import { Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <Spinner />;
    case Status.FAILURE:
      return <div>failed</div>;
    case Status.SUCCESS:
      return <Map />;
  }
};

function App() {
  const center = { lat: -34.397, lng: 150.644 };
  const zoom = 4;

  return (
    <Wrapper apiKey={process.env.REACT_APP_API_KEY} render={render}>
      <Map center={center} zoom={zoom} />
    </Wrapper>
  );
}

export default App;
