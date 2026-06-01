import { auth, googleProvider, db } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Heart, Chrome, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import SecretPhraseGate from './SecretPhraseGate';

export default function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in our partners collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName || 'Ashwin/Khushi',
          email: user.email,
          photoURL: user.photoURL,
          role: 'partner',
          createdAt: new Date().toISOString()
        });
      }
      
      onAuthenticated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 relative overflow-hidden heart-bg">
      <AnimatePresence mode="wait">
        {!isVerified ? (
          <SecretPhraseGate 
            key="gate"
            onSuccess={() => setIsVerified(true)}
            onCancel={() => {}}
          />
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-[40px] p-8 shadow-2xl shadow-rose-200 border border-white z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-rose-100 p-4 rounded-full">
                <Heart className="w-12 h-12 text-rose-500 fill-rose-500" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2 font-playful tracking-tight">Identity Verified</h1>
              <p className="text-slate-500 text-sm">
                Now, please sign in with your <span className="text-rose-500 font-bold">Google Account</span> to enter.
              </p>
            </div>

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 px-6 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin text-rose-500" size={20} />
              ) : (
                <>
                  <Chrome className="w-5 h-5 text-rose-500" />
                  Continue with Google
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 text-xs text-rose-500 text-center font-medium bg-rose-50 p-2 rounded-lg">
                {error}
              </p>
            )}

            <button 
              onClick={() => setIsVerified(false)}
              className="mt-6 w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em]"
            >
              Back to Gate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-rose-200/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-amber-100/50 rounded-full blur-3xl" />
    </div>
  );
}
