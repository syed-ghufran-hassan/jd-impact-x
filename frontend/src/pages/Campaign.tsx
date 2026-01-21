import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Heart, 
  Clock, 
  Users, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Loader2,
  ArrowDownCircle
} from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';
import { DonateModal } from '../components/DonateModal';
import { truncateAddress } from '../lib/helpers';
import { getFullCampaign, type FullCampaign } from '../lib/campaigns';
import { claimFunds } from '../lib/stacks';
import { useStacksWallet } from '../hooks/useStacksWallet';

export function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { connected, stxAddress } = useStacksWallet();
  const [campaign, setCampaign] = useState<FullCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    setLoading(true);
    try {
      const campaignId = parseInt(id || '1');
      const data = await getFullCampaign(campaignId);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: campaign?.description,
          url,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaim = async () => {
    if (!campaign) return;
    
    setClaiming(true);
    setClaimError(null);
    
    try {
      const result = await claimFunds(campaign.id);
      console.log('Claim transaction:', result.txId);
      setClaimSuccess(true);
      // Reload campaign after claim
      setTimeout(loadCampaign, 3000);
    } catch (error: any) {
      console.error('Failed to claim funds:', error);
      setClaimError(error.message || 'Failed to claim funds');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-dark-700 rounded w-24" />
        <div className="h-64 bg-dark-700 rounded-xl" />
        <div className="h-8 bg-dark-700 rounded w-3/4" />
        <div className="h-4 bg-dark-700 rounded w-full" />
        <div className="h-4 bg-dark-700 rounded w-2/3" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="glass-card text-center py-16 px-6">
        <AlertTriangle className="w-12 h-12 text-primary-400 mx-auto mb-4" />
        <h2 className="text-xl font-heading font-semibold text-dark-100 mb-2">Campaign not found</h2>
        <p className="text-dark-400 mb-6">This campaign may have been removed or doesn't exist.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to campaigns
        </Link>
      </div>
    );
  }

  const isComplete = campaign.raised >= campaign.goal;
  const isExpired = campaign.daysLeft <= 0;
  const percentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const isOwner = connected && stxAddress === campaign.owner;
  const canClaim = isOwner && isComplete && !campaign.claimed;

  return (
    <div className="max-w-5xl mx-auto animate-in">
      {/* Back Link */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-body">Back to campaigns</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden glass-card">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
            
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="badge-primary">
                {campaign.category}
              </span>
              {isComplete && (
                <span className="badge-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Funded
                </span>
              )}
              {campaign.claimed && (
                <span className="badge px-2 py-0.5 bg-dark-700 text-dark-400">
                  Claimed
                </span>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-dark-100 mb-4">
              {campaign.title}
            </h1>
            <p className="text-dark-300 text-lg font-body">
              {campaign.description}
            </p>
          </div>

          {/* Story */}
          {campaign.story && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-heading font-semibold text-dark-100 mb-4">Campaign Story</h2>
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: campaign.story }}
              />
            </div>
          )}

          {/* Creator Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-heading font-semibold text-dark-100 mb-4">Campaign Creator</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                <span className="text-primary-400 font-heading font-bold text-lg">
                  {campaign.owner.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="font-heading font-medium text-dark-100">
                  {truncateAddress(campaign.owner)}
                  {isOwner && <span className="ml-2 text-primary-400">(You)</span>}
                </p>
                <a
                  href={`https://explorer.hiro.so/address/${campaign.owner}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* On-chain Info */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-heading font-semibold text-dark-100 mb-4">On-Chain Data</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Campaign ID</span>
                <span className="text-dark-100 font-mono">#{campaign.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">IPFS Hash</span>
                <a 
                  href={`https://ipfs.io/ipfs/${campaign.ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 font-mono text-xs hover:underline"
                >
                  {campaign.ipfsHash.slice(0, 20)}...
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Deadline Block</span>
                <span className="text-dark-100 font-mono">{campaign.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Status</span>
                <span className={campaign.claimed ? 'text-dark-400' : isComplete ? 'text-success-400' : 'text-primary-400'}>
                  {campaign.claimed ? 'Claimed' : isComplete ? 'Goal Met' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Card */}
          <div className="glass-card p-6 sticky top-24">
            {/* Amount Raised */}
            <div className="mb-4">
              <div className="text-3xl font-heading font-bold text-primary-400">
                ${campaign.raised.toLocaleString()}
              </div>
              <div className="text-dark-400 font-body">
                raised of ${campaign.goal.toLocaleString()} goal
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <ProgressBar 
                raised={campaign.raised} 
                goal={campaign.goal}
                showLabels={false}
                size="lg"
              />
              <div className="text-sm text-dark-400 mt-2 font-heading">
                <span className="text-primary-400">{percentage.toFixed(0)}%</span> funded
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Users className="w-5 h-5 text-secondary-400" />
                <div>
                  <div className="font-heading font-semibold text-dark-100">{campaign.backers}</div>
                  <div className="text-xs text-dark-500">backers</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <Clock className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="font-heading font-semibold text-dark-100">
                    {campaign.daysLeft > 0 ? campaign.daysLeft : 0}
                  </div>
                  <div className="text-xs text-dark-500">days left</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            {canClaim ? (
              <div className="space-y-3">
                <button
                  onClick={handleClaim}
                  disabled={claiming || claimSuccess}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Claiming...
                    </>
                  ) : claimSuccess ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Claimed!
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Claim Funds
                    </>
                  )}
                </button>
                {claimError && (
                  <p className="text-sm text-red-400">{claimError}</p>
                )}
                <p className="text-xs text-dark-400 text-center">
                  5% platform fee will be deducted
                </p>
              </div>
            ) : campaign.claimed ? (
              <div className="w-full py-3 bg-dark-700 text-dark-400 rounded-xl font-medium text-center mb-3">
                Funds have been claimed
              </div>
            ) : !isExpired ? (
              <button
                onClick={() => setShowDonateModal(true)}
                className="w-full btn-primary mb-3"
              >
                Back this project
              </button>
            ) : (
              <div className="w-full py-3 bg-dark-700 text-dark-400 rounded-xl font-medium text-center mb-3">
                Campaign ended
              </div>
            )}

            {isOwner && !campaign.claimed && (
              <button
                className="w-full btn-secondary flex items-center justify-center gap-2 mt-3"
              >
                <ArrowDownCircle className="w-4 h-4" />
              </button>
            )}

            <div className="flex gap-2 mt-3">
              <button 
                onClick={handleShare}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Save
              </button>
            </div>

            {/* Bridge Info */}
            {!campaign.claimed && !isExpired && (
              <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                <p className="text-xs text-primary-300">
                  <strong>Cross-chain donation:</strong> Your USDC on Ethereum will be 
                  bridged to Stacks via Circle xReserve (~15 min).
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        campaignTitle={campaign.title}
        campaignId={campaign.id}
      />

    </div>
  );
}
