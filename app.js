// Simplified app.js for multi-page structure

// Tab Navigation (for main index.html page only)
function showTab(tabName) {
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const targetSection = document.getElementById(tabName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked tab
    const activeTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Navigation functions for action cards
function navigateToScan() {
    window.location.href = 'scan.html';
}

function navigateToDashboard() {
    window.location.href = 'dashboard.html';
}

function navigateToChallenge() {
    window.location.href = 'challenge.html';
}

function navigateToResults() {
    window.location.href = 'results.html';
}

function navigateToSettings() {
    window.location.href = 'settings.html';
}

// Handle hash navigation for tabs
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['overview', 'history', 'tips'].includes(hash)) {
        showTab(hash);
    } else {
        showTab('overview');
    }
});

// Handle hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['overview', 'history', 'tips'].includes(hash)) {
        showTab(hash);
    }
});

// API Configuration for backend connection - FIXED: Use correct port
const API_BASE_URL = 'http://localhost:8002'

// API helper functions
const API = {
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: 'Backend unavailable' };
        }
    },

    async analyzeFood(imageFile) {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            
            const response = await fetch(`${API_BASE_URL}/analyze-food`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Food analysis failed:', error);
            throw error;
        }
    },

    async getReports(limit = 50) {
        try {
            const response = await fetch(`${API_BASE_URL}/reports?limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            throw error;
        }
    },

    async getUserStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/user/stats`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
            throw error;
        }
    },

    async getAnalysisStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/analysis/stats`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analysis stats:', error);
            throw error;
        }
    }
};

// Load and display recent history data on index page
async function loadRecentHistory() {
    try {
        const response = await API.getReports(10);
        if (response.success && response.reports) {
            updateHistoryDisplay(response.reports);
        }
    } catch (error) {
        console.error('Failed to load recent history:', error);
        // Keep existing mock data if API fails
    }
}

// Update history tab with real data
function updateHistoryDisplay(reports) {
    // Update the list container in history tab
    const listContainer = document.querySelector('#history .list-container');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    reports.slice(0, 4).forEach(report => {
        try {
            // Parse report content
            const content = report.content;
            const lines = content.split('\n');
            
            let foodType = 'Unknown';
            let riskLevel = 'UNKNOWN';
            
            lines.forEach(line => {
                if (line.startsWith('FOOD:')) {
                    foodType = line.split(':')[1].trim();
                } else if (line.startsWith('RISK:')) {
                    riskLevel = line.split(':')[1].trim();
                }
            });
            
            // Format timestamp
            const date = new Date(report.timestamp);
            const timeAgo = formatTimeAgo(date);
            
            // Create list item
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="list-icon">✓</div>
                <div class="list-content">
                    <div class="list-title">${foodType} Analysis</div>
                    <div class="list-subtitle">${timeAgo}</div>
                </div>
                <div class="list-value">${riskLevel}</div>
            `;
            
            listContainer.appendChild(listItem);
        } catch (error) {
            console.error('Error parsing report:', error);
        }
    });
}

// Format time ago helper
function formatTimeAgo(date) {
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
}

// Update stats with real data
async function loadRealStats() {
    try {
        const [userStatsResponse, analysisStatsResponse] = await Promise.all([
            API.getUserStats(),
            API.getAnalysisStats()
        ]);
        
        // Update overview stats
        if (analysisStatsResponse.success) {
            const stats = analysisStatsResponse.stats;
            
            // Update stat cards
            const statCards = document.querySelectorAll('.stat-card .stat-number');
            if (statCards[0]) statCards[0].textContent = stats.total_analyses || 0;
            if (statCards[1]) statCards[1].textContent = (stats.average_microplastics || 0).toFixed(1);
            if (statCards[2]) {
                const healthScore = calculateHealthScore(stats.risk_distribution || {});
                statCards[2].textContent = (healthScore / 100 * 5).toFixed(1);
            }
        }
        
        // Update results grid in history
        if (analysisStatsResponse.success) {
            const stats = analysisStatsResponse.stats;
            const resultItems = document.querySelectorAll('#history .result-item .result-value');
            
            if (resultItems[0]) resultItems[0].textContent = stats.total_analyses || 0;
            if (resultItems[1]) resultItems[1].textContent = stats.recent_analyses || 0;
            if (resultItems[2]) {
                const healthScore = calculateHealthScore(stats.risk_distribution || {});
                resultItems[2].textContent = healthScore + '%';
            }
            if (resultItems[3]) resultItems[3].textContent = (stats.average_microplastics || 0).toFixed(1);
        }
        
    } catch (error) {
        console.error('Failed to load real stats:', error);
    }
}

// ADDED: Update chart in history tab on index page
// FIXED: Update chart in history tab on index page
async function updateHistoryChart() {
    try {
        const reportsResponse = await API.getReports(50);
        if (reportsResponse.success && reportsResponse.reports) {
            const reports = reportsResponse.reports;
            
            // Generate daily data for last 7 days
            const dailyData = new Array(7).fill(0);
            const today = new Date();
            
            reports.forEach(report => {
                const reportDate = new Date(report.timestamp);
                const daysAgo = Math.floor((today - reportDate) / (1000 * 60 * 60 * 24));
                
                if (daysAgo >= 0 && daysAgo < 7) {
                    dailyData[6 - daysAgo]++;
                }
            });
            
            // Find the chart element
            const chartElement = document.querySelector('.mock-chart');
            console.log('Chart element found:', chartElement);
            
            if (chartElement) {
                // Clear and update the chart
                chartElement.innerHTML = '';
                chartElement.style.cssText = `
                    height: 120px;
                    background: rgba(255, 255, 255, 0.1) !important;
                    border-radius: 16px;
                    display: flex !important;
                    align-items: end !important;
                    padding: 20px !important;
                    gap: 8px !important;
                `;
                
                const maxValue = Math.max(...dailyData, 1);
                
                dailyData.forEach((count, index) => {
                    const height = Math.max((count / maxValue) * 100, 10);
                    const bar = document.createElement('div');
                    bar.style.cssText = `
                        flex: 1;
                        background: linear-gradient(135deg, #10b981, #34d399);
                        border-radius: 4px;
                        height: ${height}%;
                        transition: all 0.3s ease;
                    `;
                    bar.title = `Day ${index + 1}: ${count} scans`;
                    chartElement.appendChild(bar);
                });
                
                console.log('History chart updated with real data:', dailyData);
            }
        }
    } catch (error) {
        console.error('Failed to update history chart:', error);
    }
}
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        const analysisStatsResponse = await API.getAnalysisStats();
        if (analysisStatsResponse.success) {
            const stats = analysisStatsResponse.stats;
            console.log('Dashboard stats:', stats);
            
            // Update dashboard stat cards (different selectors than index page)
            const totalScans = document.getElementById('total-scans');
            const averageLevel = document.getElementById('average-level');
            const healthScore = document.getElementById('health-score');
            
            if (totalScans) totalScans.textContent = stats.total_analyses || 0;
            if (averageLevel) averageLevel.textContent = (stats.average_microplastics || 0).toFixed(1) + ' ppm';
            if (healthScore) {
                const score = calculateHealthScore(stats.risk_distribution || {});
                healthScore.textContent = score + '%';
            }
        }

        // Load recent reports for activity list
        const reportsResponse = await API.getReports(5);
        if (reportsResponse.success && reportsResponse.reports) {
            updateDashboardActivity(reportsResponse.reports);
        }
        
        console.log('Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// ADDED: Update dashboard activity list
function updateDashboardActivity(reports) {
    const activityList = document.getElementById('activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    if (reports.length === 0) {
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-icon">📱</div>
                <div class="activity-content">
                    <div class="activity-title">No scans yet</div>
                    <div class="activity-subtitle">Start scanning to see your activity</div>
                </div>
                <div class="activity-result">-</div>
            </div>
        `;
        return;
    }
    
    reports.slice(0, 5).forEach(report => {
        try {
            // Parse report content
            const content = report.content;
            const lines = content.split('\n');
            
            let foodType = 'Unknown';
            let riskLevel = 'UNKNOWN';
            
            lines.forEach(line => {
                if (line.startsWith('FOOD:')) {
                    foodType = line.split(':')[1].trim();
                } else if (line.startsWith('RISK:')) {
                    riskLevel = line.split(':')[1].trim();
                }
            });
            
            // Format timestamp
            const date = new Date(report.timestamp);
            const timeAgo = formatTimeAgo(date);
            
            // Determine risk class
            const riskClass = riskLevel.toLowerCase();
            
            // Create activity item
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">✓</div>
                <div class="activity-content">
                    <div class="activity-title">${foodType} Analysis</div>
                    <div class="activity-subtitle">${timeAgo}</div>
                </div>
                <div class="activity-result ${riskClass}">${riskLevel}</div>
            `;
            
            activityList.appendChild(activityItem);
        } catch (error) {
            console.error('Error parsing report:', error);
        }
    });
}

// Calculate health score
function calculateHealthScore(riskDist) {
    const total = (riskDist.low || 0) + (riskDist.medium || 0) + (riskDist.high || 0);
    if (total === 0) return 100;
    
    const score = ((riskDist.low || 0) * 100 + (riskDist.medium || 0) * 60 + (riskDist.high || 0) * 20) / total;
    return Math.round(score);
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 300px;
                animation: slideIn 0.3s ease;
                font-family: 'Montserrat', sans-serif;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .notification-info { background: #3b82f6; }
            .notification-warning { background: #f59e0b; }
            .notification-error { background: #ef4444; }
            .notification-success { background: #10b981; }
            .notification button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                margin: 0;
                transition: opacity 0.2s;
            }
            .notification button:hover {
                opacity: 0.8;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// UPDATED: Initialize app when DOM is loaded with dashboard support
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Microplastics Analyzer App Initialized');
    
    // Check page type
    const isIndexPage = window.location.pathname === '/' || 
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname === '/index.html';
    
    const isDashboardPage = window.location.pathname.endsWith('dashboard.html');
    
    if (isIndexPage) {
        // Load real data for index page
        try {
            const healthCheck = await API.checkHealth();
            
            if (healthCheck.status !== 'error') {
                console.log('Backend connected successfully');
                showNotification('✅ Connected to AI backend', 'success');
                
                await Promise.all([
                    loadRecentHistory(),
                    loadRealStats(),
                    updateHistoryChart()
                ]);
                
                console.log('Real data loaded successfully');
            } else {
                console.warn('Backend unavailable - using offline mode');
                showNotification('⚠️ Backend unavailable - using demo data', 'warning');
            }
        } catch (error) {
            console.error('Failed to connect to backend:', error);
            showNotification('❌ Backend connection failed', 'error');
        }
        
        // Initialize hash navigation
        const hash = window.location.hash.substring(1);
        if (hash && ['overview', 'history', 'tips'].includes(hash)) {
            showTab(hash);
        } else {
            showTab('overview');
        }
    } else if (isDashboardPage) {
        // ADDED: Load real data for dashboard page
        try {
            const healthCheck = await API.checkHealth();
            
            if (healthCheck.status !== 'error') {
                console.log('Backend connected for dashboard');
                showNotification('✅ Connected to AI backend', 'success');
                
                await loadDashboardData();
                
                console.log('Dashboard data loaded successfully');
            } else {
                console.warn('Backend unavailable for dashboard');
                showNotification('⚠️ Backend unavailable - using demo data', 'warning');
            }
        } catch (error) {
            console.error('Failed to connect to backend for dashboard:', error);
            showNotification('❌ Backend connection failed', 'error');
        }
    }
});

// Export API for use in other parts of the app
window.MicroplasticsAPI = API;