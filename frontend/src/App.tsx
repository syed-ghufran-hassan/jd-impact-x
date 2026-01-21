import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { CampaignPage } from './pages/Campaign';
import { CreatePage } from './pages/Create';
import { MyCampaignsPage } from './pages/MyCampaigns';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/my-campaigns" element={<MyCampaignsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
