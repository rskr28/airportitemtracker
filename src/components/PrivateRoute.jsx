import { Navigate, Route } from 'react-router-dom';
import { useLocalStorage } from 'react-use';


const PrivateRoute = ({ component: Component, ...rest }) => {
  const [token] = useLocalStorage('token');

  return (
    <Route
      {...rest}
      element={token ? <Component {...rest} /> : <Navigate to="/log-in" />}
    />
  );
};
export default PrivateRoute;

