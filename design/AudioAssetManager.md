/**
 * @PATH AudioAssetManager.jsx
 * @REV 20260214-0753
// @MODULE "CONTENT"
// @STATUS "DEPRECATED"
// @DESC "Manages the viewing, playback, and deletion of audio assets that have been ingested into the system."
// @CHANGELOG ""
// @DEVNOTES ""
//=====================================*/
// @IMPORT-START
//import React, { useState, useEffect } from 'react';
//import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
//import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
//import { db } from '../../lib/firebase';
//import { useAuth } from '../../stores/AuthContext';
//import { useApp } from '../../stores/AppContext';
//import { MainLayout } from '../../layouts/MainLayout';
//import toast from 'react-hot-toast';
// @IMPORT-END
//=====================================

const AudioAssetManager = () => {
  const { currentUser } = useAuth();
  const { tenantId } = useApp();
  const [audioAssets, setAudioAssets] = useState([]);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetFile, setNewAssetFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('message');
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  useEffect(() => {
    if (!currentUser || !tenantId) return;

    const audioCollectionPath = `tenants/${tenantId}/ae_outputs`;
    const q = query(collection(db, audioCollectionPath), where('intakeType', '==', 'audio'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAudioAssets(assets);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to audio assets:", error);
      toast.error("Could not load audio assets.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, currentUser, tenantId]);

  const showMessage = (text) => {
    setMessage(text);
    setModalType('message');
    setIsModalOpen(true);
  };

  const showConfirm = (text, onConfirm) => {
    setMessage(text);
    setModalType('confirm');
    setIsModalOpen(true);
    setPendingDeletion(() => onConfirm);
  };

  const handleModalConfirm = () => {
    if (pendingDeletion) {
      pendingDeletion();
    }
    setIsModalOpen(false);
    setPendingDeletion(null);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setPendingDeletion(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setNewAssetFile(file);
    } else {
      showMessage('Please select a valid audio file.');
    }
  };

  const handleAddAsset = async () => {
    if (!newAssetName.trim() || !newAssetFile) {
      showMessage('Please enter a name and select an audio file.');
      return;
    }
    if (!currentUser || !tenantId) {
      showMessage('Authentication or tenant information is missing. Please try again.');
      return;
    }

    try {
      const storage = getStorage();
      const filePath = `tenants/${tenantId}/audio/${Date.now()}_${newAssetFile.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, newAssetFile);
      const downloadURL = await getDownloadURL(storageRef);

      const dataToSave = {
        title: newAssetName,
        intakeType: 'audio',
        status: 'raw',
        sourceAudioUrl: downloadURL,
        storagePath: filePath, // Use storagePath for consistency
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerId: currentUser.uid,
        audioMetadata: {
          license: 'Royalty-Free', // Default values or could be from a form
          moodTags: [],
        },
      };

      const audioCollectionRef = collection(db, `tenants/${tenantId}/ae_outputs`);
      await setDoc(doc(audioCollectionRef), dataToSave);

      toast.success('Audio asset added successfully!');
      setNewAssetName('');
      setNewAssetFile(null);
      document.getElementById('file-input').value = null;
    } catch (e) {
      console.error("Error adding audio asset:", e);
      toast.error('Failed to add audio asset.');
    }
  };

  const handleDeleteAsset = async (assetId, storagePath) => {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      const docRef = doc(db, `tenants/${tenantId}/ae_outputs`, assetId);
      await deleteDoc(docRef);
      toast.success('Audio asset deleted successfully!');
    } catch (e) {
      console.error("Error deleting asset:", e);
      toast.error('Failed to delete audio asset.');
    }
  };

  const handlePlayAudio = (url) => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
    }
    const audio = new Audio(url);
    audio.play().catch(e => {
      console.error("Audio playback failed:", e);
      showMessage("Failed to play audio. The browser may be blocking playback.");
    });
    setPlayingAudio(audio);
  };
  
  const handlePauseAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
    }
  };

  const handleStopAudio = () => {
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.currentTime = 0;
      setPlayingAudio(null);
    }
  };

  const headerConfig = {
    title: 'Audio Asset Manager',
    subtitle: 'Manage and review your audio assets ingested into the system.'
  };

  if (!currentUser || isLoading) {
    return (
      <MainLayout headerConfig={headerConfig}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerConfig={headerConfig}>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-surface-secondary/50 rounded-xl shadow-2xl p-6 md:p-8 space-y-8 border border-border-primary">
          {/* Upload Section */}
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Add New Audio Asset</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter asset name"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
                className="flex-grow p-3 rounded-lg bg-surface-secondary border border-border-primary text-text-primary placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              <label className="flex items-center justify-center p-3 rounded-lg bg-surface-tertiary text-text-primary font-semibold cursor-pointer hover:bg-surface-secondary transition-colors">
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {newAssetFile ? `Selected: ${newAssetFile.name}` : 'Choose File'}
              </label>
            </div>
            <button
              onClick={handleAddAsset}
              className="w-full p-3 rounded-lg bg-accent text-white font-bold hover:brightness-125 transition-colors shadow-md disabled:bg-accent-50 disabled:cursor-not-allowed"
              disabled={!newAssetName.trim() || !newAssetFile}
            >
              Upload Asset
            </button>
          </section>

          {/* Asset List Section */}
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Your Audio Assets</h2>
            {audioAssets.length === 0 ? (
              <p className="text-center text-text-secondary py-8">No audio assets found. Upload one to get started!</p>
            ) : (
              <div className="space-y-4">
                {audioAssets.map(asset => (
                  <div key={asset.id} className="bg-surface-secondary p-4 rounded-lg flex flex-col md:flex-row items-center justify-between shadow-sm border border-border-primary">
                    <div className="flex-grow text-text-primary overflow-hidden break-words">
                      <p className="font-semibold text-lg">{asset.title}</p>
                      <p className="text-sm text-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{asset.sourceAudioUrl}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handlePlayAudio(asset.sourceAudioUrl)}
                        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        title="Play"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePauseAudio()}
                        className="p-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                        title="Pause"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM9.5 7A1.5 1.5 0 008 8.5v3A1.5 1.5 0 009.5 13h1A1.5 1.5 0 0012 11.5v-3A1.5 1.5 0 0010.5 7h-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleStopAudio()}
                        className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                        title="Stop"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => showConfirm('Are you sure you want to delete this asset?', () => handleDeleteAsset(asset.id, asset.storagePath))}
                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.728-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal/Message Box */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-surface-secondary p-6 rounded-lg shadow-xl border border-border-primary w-full max-w-sm text-center">
            <p className="text-lg text-text-primary mb-4">{message}</p>
            <div className="flex justify-center gap-4">
              {modalType === 'message' && (
                <button
                  onClick={handleModalCancel}
                  className="px-6 py-2 rounded-lg bg-accent text-white font-semibold hover:brightness-125 transition-colors"
                >
                  OK
                </button>
              )}
              {modalType === 'confirm' && (
                <>
                  <button
                    onClick={handleModalConfirm}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleModalCancel}
                    className="px-6 py-2 rounded-lg bg-zinc-600 text-white font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AudioAssetManager;
