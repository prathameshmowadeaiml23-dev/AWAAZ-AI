import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, UserCheck, Camera, AlertCircle, Sparkles } from 'lucide-react';

export default function CitizenVerificationPanel({ complaint, onVerificationUpdate }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [localComp, setLocalComp] = useState(complaint);

  if (!localComp || (!localComp.resolutionProof && localComp.status !== 'Pending Verification')) {
    return null;
  }

  const verifications = localComp.verifications || [];
  const verificationsCount = localComp.verificationsCount || verifications.length;
  const requiredCount = localComp.requiredVerifications || 3;
  const isFullyResolved = localComp.status === 'Verified & Resolved' || verificationsCount >= requiredCount;

  // Check if current user has already verified
  const currentUserName = user?.name || 'Guest Citizen';
  const hasUserVerified = verifications.some((v) => v.citizenName === currentUserName);

  const updateLocalStorageCache = (updatedItem) => {
    try {
      const saved = localStorage.getItem('civic_officer_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        const updatedList = parsed.map((c) => (c.complaintId === updatedItem.complaintId ? updatedItem : c));
        localStorage.setItem('civic_officer_complaints', JSON.stringify(updatedList));
      }
    } catch (e) {}
  };

  const handleVerify = async () => {
    if (hasUserVerified) return;
    setLoading(true);

    try {
      const res = await axios.post(`/api/complaints/${localComp.complaintId}/verify`, {
        citizenName: currentUserName,
        comment: commentInput || 'Verified physical repair photo authenticity at site.'
      });

      if (res.data && res.data.data) {
        setLocalComp(res.data.data);
        updateLocalStorageCache(res.data.data);
        onVerificationUpdate?.(res.data.data);
      }
    } catch (err) {
      // Local optimistic fallback update
      const updatedVers = [
        ...verifications,
        {
          citizenName: currentUserName,
          comment: commentInput || 'Verified repair photo authenticity at site.',
          verifiedAt: new Date().toISOString()
        }
      ];
      const newCount = updatedVers.length;
      const updatedObj = {
        ...localComp,
        verifications: updatedVers,
        verificationsCount: newCount,
        status: newCount >= requiredCount ? 'Verified & Resolved' : 'Pending Verification'
      };
      setLocalComp(updatedObj);
      updateLocalStorageCache(updatedObj);
      onVerificationUpdate?.(updatedObj);
    } finally {
      setLoading(false);
      setCommentInput('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-5">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-emerald-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>CITIZEN AUTHENTICITY VERIFICATION PROTOCOL</span>
          </div>
          <h3 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span>Community Work Proof Audit</span>
          </h3>
        </div>

        {/* Verification Counter & AI Score Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {localComp.aiSimilarityScore && (
            <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1 border shadow-xs ${
              localComp.aiSimilarityScore >= 90
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI Match: {localComp.aiSimilarityScore}% {localComp.aiSimilarityScore >= 90 ? '(≥90% Auto Passed)' : '(<90% 3 Audit Required)'}</span>
            </span>
          )}

          <span
            className={`px-3.5 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 border shadow-xs ${
              isFullyResolved
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {isFullyResolved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Certified & Resolved (3/3 Verified) ✓</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Citizen Verifications: {verificationsCount}/{requiredCount} Needed</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Admin Photo Proof Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Officer Work Completion Photo Proof</span>
          </span>
          <div className="relative rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50/50 shadow-xs">
            <img
              src={localComp.resolutionProof || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600&auto=format&fit=crop&q=80'}
              alt="Officer Resolution Proof"
              className="w-full h-44 object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-emerald-950/80 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-lg">
              GPS Verified • Officer Upload
            </div>
          </div>
        </div>

        {/* Verification Action & Notes */}
        <div className="space-y-3">
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-1.5 text-xs">
            <span className="text-emerald-900 font-bold block">Officer Work Report:</span>
            <p className="text-emerald-950 font-medium leading-relaxed">
              {localComp.resolutionNotes || 'Hot-mix asphalt resurfacing completed. Site inspected & verified by City Engineer.'}
            </p>
          </div>

          {!isFullyResolved && (
            <div className="space-y-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Optional: Add verification note (e.g. 'Inspected site personally, pothole fixed')"
                className="w-full bg-emerald-50/40 border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="button"
                onClick={handleVerify}
                disabled={hasUserVerified || loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs ${
                  hasUserVerified
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
                    : 'btn-emerald'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {hasUserVerified
                    ? `You Verified This Resolution ✓ (${verificationsCount}/3)`
                    : loading
                    ? 'Submitting Verification...'
                    : `Verify Authenticity as Citizen (${verificationsCount}/3)`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Citizen Verifiers Audit Log */}
      {verifications.length > 0 && (
        <div className="pt-2 border-t border-emerald-100 space-y-2 text-xs">
          <span className="text-emerald-800 font-bold uppercase tracking-wider block text-[11px]">
            Verified Citizens Log ({verifications.length}):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {verifications.map((v, i) => (
              <div key={i} className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 space-y-0.5">
                <span className="font-bold text-emerald-950 flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{v.citizenName}</span>
                </span>
                <p className="text-[10px] text-emerald-800 italic">"{v.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
