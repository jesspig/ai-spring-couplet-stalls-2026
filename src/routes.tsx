import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DesignInput from './DesignInput';
import LoadingPage from './pages/LoadingPage';
import DisplayPage from './pages/DisplayPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DesignInput />
      },
      {
        path: 'loading',
        element: <LoadingPage />
      },
      {
        path: 'display',
        element: <DisplayPage />
      }
    ]
  }
]);