import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DesignInput from './pages/DesignInput';
import LoadingPage from './pages/LoadingPage';
import DisplayPage from './pages/DisplayPage';

// 根据环境确定 base 路径
const basename = import.meta.env.BASE_URL || '/';

export const router = createBrowserRouter(
  [
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
          path: 'loading/:uuid',
          element: <LoadingPage />
        },
        {
          path: 'display',
          element: <DisplayPage />
        },
        {
          path: 'display/:uuid',
          element: <DisplayPage />
        }
      ]
    }
  ],
  {
    basename: basename
  }
);