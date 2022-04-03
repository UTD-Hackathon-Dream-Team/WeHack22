import { Wrapper, Status } from "@googlemaps/react-wrapper";
import Map from "./Map";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
  return (
    <Wrapper apiKey={"YOUR_API_KEY"} render={render}>
      <Map />
    </Wrapper>
  );
}

export default App;
