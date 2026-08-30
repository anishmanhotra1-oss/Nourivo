import React, { useEffect, useState, useRef } from 'react';
import { Users, MessageSquare, Search, UserPlus, Check, X, Send, Globe, ShieldCheck, Activity, RefreshCw, Swords } from 'lucide-react';
import { socialService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AnimatedFriendTargetCard } from '../components/telemetry/AnimatedFriendTargetCard';
import { CreateFriendChallengeModal } from '../components/telemetry/CreateFriendChallengeModal';

export const SocialPage: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'lounge' | 'direct' | 'directory'>('lounge');

  // Friends & Directory State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);

  // Challenge Modal State
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [activeChallengeCategory, setActiveChallengeCategory] = useState<'steps' | 'distance' | 'water'>('steps');
  const [activeChallengeGoal, setActiveChallengeGoal] = useState<number>(10000);

  // Chat State
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchFriendsAndRequests = async () => {
    try {
      const data = await socialService.getFriendsList();
      setFriendsList(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (error) {
      console.error('Failed to fetch friends telemetry:', error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const targetReceiverId = activeSubTab === 'lounge' ? 'global' : selectedFriend?.id;
      if (activeSubTab === 'direct' && !selectedFriend) return;

      const messages = await socialService.getChatMessages(targetReceiverId);
      setChatMessages(messages || []);
    } catch (error) {
      console.error('Failed to sync chat messages:', error);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchFriendsAndRequests();
  }, []);

  // Fetch chat messages when active tab or selected friend changes
  useEffect(() => {
    fetchChatMessages();
  }, [activeSubTab, selectedFriend]);

  // Auto-polling Real-Time Sync (Every 3 seconds) for live chat updates
  useEffect(() => {
    const pollingInterval = setInterval(() => {
      fetchChatMessages();
      fetchFriendsAndRequests();
    }, 3000);

    return () => clearInterval(pollingInterval);
  }, [activeSubTab, selectedFriend]);

  // Auto scroll inner chat container to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSearchUsers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await socialService.searchUsers(searchQuery.trim());
      setSearchResults(results || []);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      await socialService.sendFriendRequest(targetUserId);
      if (searchQuery.trim()) {
        const results = await socialService.searchUsers(searchQuery.trim());
        setSearchResults(results || []);
      }
      fetchFriendsAndRequests();
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptFriendRequest = async (friendshipId: string) => {
    try {
      await socialService.acceptFriendRequest(friendshipId);
      fetchFriendsAndRequests();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRemoveFriendship = async (friendshipId: string) => {
    try {
      await socialService.removeFriendship(friendshipId);
      fetchFriendsAndRequests();
    } catch (error) {
      console.error('Failed to remove friendship:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const targetReceiverId = activeSubTab === 'lounge' ? 'global' : selectedFriend?.id;
    if (activeSubTab === 'direct' && !selectedFriend) return;

    setIsSendingMessage(true);
    const contentToSend = messageInput.trim();
    setMessageInput('');

    try {
      await socialService.sendChatMessage(targetReceiverId, contentToSend);
      await fetchChatMessages();
    } catch (error) {
      console.error('Failed to send chat message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBroadcastChallenge = async (challengeMsg: string, cat: 'steps' | 'distance' | 'water', goalVal: number) => {
    if (!selectedFriend) return;
    try {
      setActiveChallengeCategory(cat);
      setActiveChallengeGoal(goalVal);
      await socialService.sendChatMessage(selectedFriend.id, challengeMsg);
      await fetchChatMessages();
    } catch (err) {
      console.error('Failed to broadcast challenge:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-4 max-w-6xl mx-auto font-sans">
      {/* Create Target Challenge Modal */}
      {selectedFriend && (
        <CreateFriendChallengeModal
          isOpen={isChallengeModalOpen}
          onClose={() => setIsChallengeModalOpen(false)}
          friendName={selectedFriend.name}
          onSendChallengeBroadcast={handleBroadcastChallenge}
        />
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-brand-400 font-medium mb-1">
            <Activity className="w-3.5 h-3.5 text-brand-500" />
            <span>ATHLETE SOCIAL NETWORK & TARGET DUELS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Friends, Chat & Target Duels
          </h2>
        </div>

        {/* Subtab Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel border border-dark-border/80 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('lounge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'lounge'
                ? 'bg-brand-600 text-white shadow-glow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Global Lounge</span>
          </button>

          <button
            onClick={() => setActiveSubTab('direct')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'direct'
                ? 'bg-brand-600 text-white shadow-glow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Chat ({friendsList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('directory')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'directory'
                ? 'bg-brand-600 text-white shadow-glow font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Find Friends</span>
            {pendingRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-mono flex items-center justify-center font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'lounge' || activeSubTab === 'direct' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 min-h-[520px]">
          {/* Direct Messaging Friend Selector (If Direct Chat view) */}
          {activeSubTab === 'direct' && (
            <div className="telemetry-card rounded-2xl p-4 space-y-3 lg:col-span-1 border border-dark-border/80">
              <h3 className="text-xs font-bold text-white font-display uppercase tracking-wider">
                Confirmed Friends ({friendsList.length})
              </h3>

              {friendsList.length === 0 ? (
                <div className="text-center py-8 text-xs font-mono text-gray-500">
                  No friends added yet. Switch to "Find Friends" tab to add athletes.
                </div>
              ) : (
                <div className="space-y-1.5 overflow-y-auto max-h-[440px]">
                  {friendsList.map((friend) => {
                    const isSelected = selectedFriend?.id === friend.id;
                    return (
                      <button
                        key={friend.id}
                        onClick={() => setSelectedFriend(friend)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500/50 text-white shadow-glow'
                            : 'bg-dark-bg/60 border-dark-border/80 text-gray-300 hover:bg-dark-surface'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-400 font-bold flex items-center justify-center text-xs">
                          {friend.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-bold font-sans truncate">{friend.name}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{friend.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Chat Messages & Friend Target Panel */}
          <div className={`telemetry-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between border border-dark-border/80 ${activeSubTab === 'direct' ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Chat Stream Header */}
            <div className="pb-3 border-b border-dark-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeSubTab === 'lounge' ? (
                  <>
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white font-display uppercase tracking-wide">
                      Global Athlete Lounge (Community Room)
                    </span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white font-display uppercase tracking-wide truncate max-w-xs">
                      {selectedFriend ? `Direct Chat with ${selectedFriend.name}` : 'Select a friend to start chatting'}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>SYNC LIVE</span>
              </div>
            </div>

            {/* Friend Target Head-to-Head Card (If Direct Chat with Friend) */}
            {activeSubTab === 'direct' && selectedFriend && (
              <div className="pt-3">
                <AnimatedFriendTargetCard
                  friendName={selectedFriend.name}
                  myScore={7800}
                  friendScore={6400}
                  targetGoal={activeChallengeGoal}
                  targetCategory={activeChallengeCategory}
                  onLaunchChallenge={() => setIsChallengeModalOpen(true)}
                />
              </div>
            )}

            {/* Message Stream */}

            {/* Message Stream */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto my-4 space-y-3 pr-2 min-h-[360px] max-h-[420px]">
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-500 font-mono text-xs">
                  <MessageSquare className="w-8 h-8 text-gray-600 mb-2" />
                  <span>No messages logged yet. Send a message to start the conversation!</span>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-gray-400">
                        <span className="font-bold text-gray-300">{isOwnMessage ? 'You' : msg.sender?.name}</span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed break-words ${
                          isOwnMessage
                            ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none shadow-glow'
                            : 'bg-dark-bg border border-dark-border/80 text-gray-200 rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input Dock */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-dark-border/80">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  activeSubTab === 'lounge'
                    ? 'Broadcast message to Global Lounge...'
                    : selectedFriend
                    ? `Message ${selectedFriend.name}...`
                    : 'Select a friend to type a message...'
                }
                disabled={activeSubTab === 'direct' && !selectedFriend}
                className="flex-1 px-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs font-sans text-white focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={isSendingMessage || !messageInput.trim() || (activeSubTab === 'direct' && !selectedFriend)}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Find & Manage Friends Directory */
        <div className="space-y-6">
          {/* Pending Incoming Requests Section */}
          {pendingRequests.length > 0 && (
            <div className="telemetry-card rounded-2xl p-6 border border-amber-500/40 space-y-4">
              <h3 className="text-xs font-bold text-amber-400 font-display uppercase tracking-wide flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Pending Friend Requests ({pendingRequests.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingRequests.map((req) => (
                  <div key={req.friendshipId} className="flex items-center justify-between p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
                    <div>
                      <div className="text-xs font-bold text-white font-sans">{req.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{req.email}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAcceptFriendRequest(req.friendshipId)}
                        className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                        title="Accept Request"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleRemoveFriendship(req.friendshipId)}
                        className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 transition-all cursor-pointer"
                        title="Decline Request"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Athlete Directory */}
          <div className="telemetry-card rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white font-display uppercase tracking-wide">
              Discover Athletes & Connect
            </h3>

            <form onSubmit={handleSearchUsers} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search athletes by name or email (e.g. demo@nourivo.app)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border/80 rounded-xl text-xs font-sans text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSearching ? 'Searching...' : 'Search'}</span>
              </button>
            </form>

            {/* Search Results Display */}
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {searchResults.map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between p-3.5 rounded-xl bg-dark-bg border border-dark-border/80">
                    <div>
                      <div className="text-xs font-bold text-white font-sans">{userItem.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{userItem.email}</div>
                    </div>

                    {userItem.friendshipStatus === 'ACCEPTED' ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Friends
                      </span>
                    ) : userItem.friendshipStatus === 'SENT_PENDING' ? (
                      <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold">
                        Pending
                      </span>
                    ) : userItem.friendshipStatus === 'RECEIVED_PENDING' ? (
                      <button
                        onClick={() => handleAcceptFriendRequest(userItem.friendshipId)}
                        className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold transition-all cursor-pointer"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendFriendRequest(userItem.id)}
                        className="px-2.5 py-1 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Add Friend</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
