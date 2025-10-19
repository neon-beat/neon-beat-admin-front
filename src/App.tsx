import { ConfigProvider, Flex, message, theme } from 'antd'
import './App.css'
import MessageContext from './Context/MessageContext'
import { ApiProvider } from './Context/ApiContext'
import { GameManagementProvider } from './Context/GameManagementContext'
import AdminHome from './Components/AdminHome';

function App() {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#9E339F',
          borderRadius: 20,
        },
      }}
    >
      <MessageContext.Provider value={{ messageApi }}>
        <ApiProvider>
          <GameManagementProvider>
            <Flex vertical gap="small" className="h-full">
              {contextHolder}
              <img src={`${import.meta.env.BASE_URL}/images/logo.png`} width={200} alt="Logo" className="nba-logo" />
              <AdminHome />
            </Flex>
          </GameManagementProvider>
        </ApiProvider>
      </MessageContext.Provider>
    </ConfigProvider>
  )
}

export default App
