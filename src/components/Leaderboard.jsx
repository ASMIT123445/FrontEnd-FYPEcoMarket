import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaTrophy, FaMedal, FaArrowLeft, FaCrown } from 'react-icons/fa';
import Header from './Header';
import axiosInstance from '../services/axiosInstance';
import '../styles/Leaderboard.css';

const rankIcon = (rank) => {
  if (rank === 1) return <FaCrown className="rank-crown" />;
  if (rank === 2) return <FaMedal className="rank-medal silver" />;
  if (rank === 3) return <FaMedal className="rank-medal bronze" />;
  return <span className="rank-number">#{rank}</span>;
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [currentUserPoints, setCurrentUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axiosInstance.get('/auth/green-points/leaderboard/');
        setLeaderboard(res.data.leaderboard);
        setCurrentUserRank(res.data.current_user_rank);
        setCurrentUserPoints(res.data.current_user_points);
      } catch (err) {
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">
      <Header />

      <div className="leaderboard-container">
        <button className="lb-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        {/* Page title */}
        <div className="lb-title-row">
          <FaTrophy className="lb-trophy-icon" />
          <div>
            <h1>Green Points Leaderboard</h1>
            <p>Top eco-conscious shoppers on Ecomarket</p>
          </div>
        </div>

        {/* Current user's rank card */}
        {currentUserRank && (
          <div className="lb-my-rank-card">
            <FaLeaf className="lb-leaf" />
            <div>
              <div className="lb-my-rank-label">Your Rank</div>
              <div className="lb-my-rank-value">#{currentUserRank}</div>
            </div>
            <div className="lb-my-rank-divider" />
            <div>
              <div className="lb-my-rank-label">Your Points</div>
              <div className="lb-my-rank-value">{currentUserPoints.toLocaleString()} pts</div>
            </div>
          </div>
        )}

        {/* Leaderboard list */}
        {loading ? (
          <div className="lb-loading">
            <div className="lb-spinner" />
            <p>Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="lb-error">{error}</div>
        ) : leaderboard.length === 0 ? (
          <div className="lb-empty">
            <FaLeaf style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: 16 }} />
            <p>No eco-warriors yet — be the first to earn Green Points!</p>
          </div>
        ) : (
          <div className="lb-list">
            {/* Top 3 podium */}
            {leaderboard.length >= 3 && (
              <div className="lb-podium">
                {/* 2nd place */}
                <div className="podium-item second">
                  <div className="podium-avatar">{leaderboard[1].display_name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{leaderboard[1].display_name}</div>
                  <div className="podium-points">{leaderboard[1].green_points.toLocaleString()}</div>
                  <div className="podium-block second-block">2</div>
                </div>
                {/* 1st place */}
                <div className="podium-item first">
                  <FaCrown className="podium-crown" />
                  <div className="podium-avatar gold">{leaderboard[0].display_name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{leaderboard[0].display_name}</div>
                  <div className="podium-points">{leaderboard[0].green_points.toLocaleString()}</div>
                  <div className="podium-block first-block">1</div>
                </div>
                {/* 3rd place */}
                <div className="podium-item third">
                  <div className="podium-avatar">{leaderboard[2].display_name.charAt(0).toUpperCase()}</div>
                  <div className="podium-name">{leaderboard[2].display_name}</div>
                  <div className="podium-points">{leaderboard[2].green_points.toLocaleString()}</div>
                  <div className="podium-block third-block">3</div>
                </div>
              </div>
            )}

            {/* Full ranked list */}
            <div className="lb-table">
              {leaderboard.map((entry) => (
                <div
                  key={entry.username}
                  className={`lb-row ${entry.is_current_user ? 'lb-row--me' : ''} ${entry.rank <= 3 ? `lb-row--top${entry.rank}` : ''}`}
                >
                  <div className="lb-rank">{rankIcon(entry.rank)}</div>
                  <div className="lb-avatar">{entry.display_name.charAt(0).toUpperCase()}</div>
                  <div className="lb-info">
                    <span className="lb-name">
                      {entry.display_name}
                      {entry.is_current_user && <span className="lb-you-badge">You</span>}
                    </span>
                    <span className="lb-username">@{entry.username}</span>
                  </div>
                  <div className="lb-points">
                    <FaLeaf className="lb-points-leaf" />
                    {entry.green_points.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
