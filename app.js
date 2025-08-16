// Comprehensive app.js for Microplastics Analyzer
// Centralized data management for all pages

class MicroplasticsDataManager {
    constructor() {
        this.scans = this.loadScans();
        this.challenges = this.loadChallenges();
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        // Initialize based on current page
        const currentPage = this.getCurrentPage();
        
        switch (currentPage) {
            case 'index':
                this.initHomePage();
                break;
            case 'dashboard':
                this.initDashboard();
                break;
            case 'scan':
                this.initScanPage();
                break;
            case 'challenge':
                this.initChallengePage();
                break;
            case 'results':
                this.initResultsPage();
                break;
            case 'settings':
                this.initSettingsPage();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        return filename || 'index';
    }

    // ============ DATA LOADING & STORAGE ============
    
    loadScans() {
        const stored = this.getFromStorage('microplastics_scans');
        if (stored && stored.length > 0) {
            return stored;
        }

        // Create realistic sample data
        const sampleScans = [
            {
                id: 1,
                name: 'Water Bottle Analysis',
                type: 'beverage_container',
                level: 5.2,
                category: 'low',
                timestamp: Date.now() - 2 * 60 * 60 * 1000,
                location: 'Kitchen',
                confidence: 94,
                notes: 'Reusable plastic bottle'
            },
            {
                id: 2,
                name: 'Food Container Scan',
                type: 'food_packaging',
                level: 18.7,
                category: 'medium',
                timestamp: Date.now() - 24 * 60 * 60 * 1000,
                location: 'Office',
                confidence: 87,
                notes: 'Takeout container'
            },
            {
                id: 3,
                name: 'Packaging Assessment',
                type: 'product_packaging',
                level: 42.3,
                category: 'high',
                timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
                location: 'Home',
                confidence: 92,
                notes: 'Disposable packaging'
            },
            {
                id: 4,
                name: 'Drink Cup Analysis',
                type: 'beverage_container',
                level: 12.1,
                category: 'medium',
                timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
                location: 'Coffee Shop',
                confidence: 89,
                notes: 'Paper cup with plastic lining'
            },
            {
                id: 5,
                name: 'Shopping Bag Check',
                type: 'bag',
                level: 7.8,
                category: 'low',
                timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
                location: 'Store',
                confidence: 91,
                notes: 'Reusable bag'
            }
        ];

        this.saveScans(sampleScans);
        return sampleScans;
    }

    loadChallenges() {
        const stored = this.getFromStorage('microplastics_challenges');
        if (stored && stored.length > 0) {
            return stored;
        }

        const defaultChallenges = [
            {
                id: 1,
                title: 'Plastic-Free Week',
                description: 'Avoid single-use plastics for 7 days',
                goal: 7,
                progress: 3,
                type: 'daily',
                status: 'active',
                startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
                endDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
                reward: 'Eco Warrior Badge'
            },
            {
                id: 2,
                title: 'Scan 20 Items',
                description: 'Analyze microplastics in 20 different items',
                goal: 20,
                progress: this.scans.length,
                type: 'scan_count',
                status: this.scans.length >= 20 ? 'completed' : 'active',
                reward: 'Data Detective Badge'
            },
            {
                id: 3,
                title: 'Low Impact Living',
                description: 'Keep average microplastic exposure below 15 ppm',
                goal: 15,
                progress: this.getAverageLevel(),
                type: 'average_level',
                status: 'active',
                reward: 'Clean Living Badge'
            }
        ];

        this.saveChallenges(defaultChallenges);
        return defaultChallenges;
    }

    loadSettings() {
        const stored = this.getFromStorage('microplastics_settings');
        return stored || {
            notifications: true,
            darkMode: false,
            dataSharing: false,
            units: 'ppm',
            scanReminders: true,
            weeklyReports: true
        };
    }

    // ============ DATA MANIPULATION ============

    addScan(scanData) {
        const newScan = {
            id: Date.now(),
            name: scanData.name,
            type: scanData.type || 'unknown',
            level: parseFloat(scanData.level),
            category: this.categorizePpm(parseFloat(scanData.level)),
            timestamp: Date.now(),
            location: scanData.location || 'Unknown',
            confidence: scanData.confidence || Math.floor(85 + Math.random() * 15),
            notes: scanData.notes || ''
        };

        this.scans.unshift(newScan);
        this.saveScans(this.scans);
        this.updateChallengeProgress();
        return newScan;
    }

    categorizePpm(level) {
        if (level <= 10) return 'low';
        if (level <= 30) return 'medium';
        return 'high';
    }

    updateChallengeProgress() {
        this.challenges.forEach(challenge => {
            switch (challenge.type) {
                case 'scan_count':
                    challenge.progress = this.scans.length;
                    challenge.status = challenge.progress >= challenge.goal ? 'completed' : 'active';
                    break;
                case 'average_level':
                    challenge.progress = this.getAverageLevel();
                    challenge.status = challenge.progress <= challenge.goal ? 'completed' : 'active';
                    break;
            }
        });
        this.saveChallenges(this.challenges);
    }

    // ============ DATA CALCULATIONS ============

    getAverageLevel() {
        if (this.scans.length === 0) return 0;
        return this.scans.reduce((sum, scan) => sum + scan.level, 0) / this.scans.length;
    }

    getWeeklyData() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weeklyData = new Array(7).fill(0);
        const weeklyCount = new Array(7).fill(0);

        this.scans.forEach(scan => {
            const dayIndex = new Date(scan.timestamp).getDay();
            weeklyData[dayIndex] += scan.level;
            weeklyCount[dayIndex]++;
        });

        return weeklyData.map((total, index) => 
            weeklyCount[index] > 0 ? total / weeklyCount[index] : 0
        );
    }

    getCategoryStats() {
        const stats = { low: 0, medium: 0, high: 0 };
        this.scans.forEach(scan => {
            stats[scan.category]++;
        });
        return stats;
    }

    getRecentScans(limit = 5) {
        return this.scans.slice(0, limit);
    }

    // ============ PAGE INITIALIZATION ============

    initHomePage() {
        this.updateOverviewTab();
        this.updateHistoryTab();
        this.updateTipsTab();
        
        // Update quick stats if they exist
        this.updateElement('.quick-stat-scans', this.scans.length);
        this.updateElement('.quick-stat-average', `${this.getAverageLevel().toFixed(1)} ppm`);
        
        // Set up tab navigation
        this.setupTabNavigation();
    }

    initDashboard() {
        this.updateDashboardStats();
        this.updateDashboardChart();
        this.updateRecentActivity();
    }

    initScanPage() {
        this.setupScanForm();
        this.displayRecentScans();
    }

    initChallengePage() {
        this.displayChallenges();
        this.updateChallengeStats();
    }

    initResultsPage() {
        this.displayDetailedResults();
        this.generateInsights();
    }

    initSettingsPage() {
        this.loadUserSettings();
        this.setupSettingsForm();
    }

    // ============ DASHBOARD UPDATES ============

    updateDashboardStats() {
        // Update total scans
        const totalElement = document.querySelector('.dashboard-stats .stat-card-large:nth-child(1) h2');
        if (totalElement) {
            totalElement.textContent = this.scans.length;
        }

        // Update average level
        const avgElement = document.querySelector('.dashboard-stats .stat-card-large:nth-child(2) h2');
        if (avgElement) {
            avgElement.textContent = `${this.getAverageLevel().toFixed(1)} ppm`;
        }

        // Update accuracy (calculated based on confidence scores)
        const accuracyElement = document.querySelector('.dashboard-stats .stat-card-large:nth-child(3) h2');
        if (accuracyElement) {
            const avgConfidence = this.scans.length > 0 ? 
                this.scans.reduce((sum, scan) => sum + scan.confidence, 0) / this.scans.length : 
                95;
            accuracyElement.textContent = `${Math.round(avgConfidence)}%`;
        }
    }

    updateDashboardChart() {
        const chartBars = document.querySelectorAll('.chart-bar');
        if (chartBars.length === 0) return;

        const weeklyData = this.getWeeklyData();
        const maxValue = Math.max(...weeklyData, 1);

        chartBars.forEach((bar, index) => {
            const percentage = (weeklyData[index] / maxValue) * 80 + 10; // 10-90% range
            bar.style.height = `${percentage}%`;
            
            // Add hover tooltip
            bar.setAttribute('title', `${weeklyData[index].toFixed(1)} ppm average`);
        });
    }

    updateRecentActivity() {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;

        if (this.scans.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <p>No scans yet</p>
                    <p>Start scanning to see your activity</p>
                </div>
            `;
            return;
        }

        const recentScans = this.getRecentScans(3);
        activityList.innerHTML = recentScans.map(scan => `
            <div class="activity-item" onclick="showScanDetails(${scan.id})">
                <div class="activity-icon">✓</div>
                <div class="activity-content">
                    <div class="activity-title">${scan.name}</div>
                    <div class="activity-subtitle">${this.formatTimeAgo(scan.timestamp)}</div>
                </div>
                <div class="activity-result ${scan.category}">${scan.category.charAt(0).toUpperCase() + scan.category.slice(1)}</div>
            </div>
        `).join('');
    }

    // ============ HOME PAGE TABS ============

    updateOverviewTab() {
        const overviewTab = document.getElementById('overview');
        if (!overviewTab) return;

        // Update overview stats
        const stats = this.getCategoryStats();
        const total = this.scans.length;
        
        const statsElements = overviewTab.querySelectorAll('.overview-stat');
        if (statsElements.length >= 3) {
            statsElements[0].querySelector('.stat-number').textContent = total;
            statsElements[1].querySelector('.stat-number').textContent = stats.low;
            statsElements[2].querySelector('.stat-number').textContent = stats.high;
        }
    }

    updateHistoryTab() {
        const historyTab = document.getElementById('history');
        if (!historyTab) return;

        const historyList = historyTab.querySelector('.history-list');
        if (!historyList) return;

        if (this.scans.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No scan history available</div>';
            return;
        }

        historyList.innerHTML = this.scans.map(scan => `
            <div class="history-item" onclick="showScanDetails(${scan.id})">
                <div class="history-date">${new Date(scan.timestamp).toLocaleDateString()}</div>
                <div class="history-content">
                    <div class="history-title">${scan.name}</div>
                    <div class="history-level">${scan.level.toFixed(1)} ppm</div>
                </div>
                <div class="history-category ${scan.category}"></div>
            </div>
        `).join('');
    }

    updateTipsTab() {
        // Tips are static content, but we can personalize based on user data
        const tipsTab = document.getElementById('tips');
        if (!tipsTab) return;

        const avgLevel = this.getAverageLevel();
        const personalizedTip = tipsTab.querySelector('.personalized-tip');
        
        if (personalizedTip) {
            if (avgLevel > 25) {
                personalizedTip.innerHTML = `
                    <h4>🎯 Personal Recommendation</h4>
                    <p>Your average exposure (${avgLevel.toFixed(1)} ppm) is high. Consider switching to glass or metal containers.</p>
                `;
            } else if (avgLevel > 15) {
                personalizedTip.innerHTML = `
                    <h4>👍 Good Progress</h4>
                    <p>Your average exposure (${avgLevel.toFixed(1)} ppm) is moderate. Focus on reducing single-use plastics.</p>
                `;
            } else {
                personalizedTip.innerHTML = `
                    <h4>🌟 Excellent Work</h4>
                    <p>Your average exposure (${avgLevel.toFixed(1)} ppm) is low. Keep up the great work!</p>
                `;
            }
        }
    }

    // ============ SCAN PAGE FUNCTIONALITY ============

    setupScanForm() {
        const scanForm = document.getElementById('scan-form');
        if (!scanForm) return;

        scanForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(scanForm);
            const scanData = {
                name: formData.get('item-name') || 'Unknown Item',
                type: formData.get('item-type') || 'unknown',
                level: formData.get('microplastic-level') || this.generateRandomLevel(),
                location: formData.get('location') || 'Unknown',
                notes: formData.get('notes') || ''
            };

            const newScan = this.addScan(scanData);
            this.showScanResult(newScan);
            scanForm.reset();
        });
    }

    generateRandomLevel() {
        // Generate realistic random level
        const categories = [
            { range: [0, 10], weight: 0.4 },
            { range: [10, 30], weight: 0.4 },
            { range: [30, 100], weight: 0.2 }
        ];

        const random = Math.random();
        let cumulative = 0;
        
        for (const category of categories) {
            cumulative += category.weight;
            if (random <= cumulative) {
                return (Math.random() * (category.range[1] - category.range[0]) + category.range[0]).toFixed(1);
            }
        }
        
        return (Math.random() * 10).toFixed(1);
    }

    showScanResult(scan) {
        const resultElement = document.getElementById('scan-result');
        if (!resultElement) {
            alert(`Scan completed!\n${scan.name}: ${scan.level} ppm (${scan.category})`);
            return;
        }

        resultElement.innerHTML = `
            <div class="scan-result-card ${scan.category}">
                <h3>Scan Complete</h3>
                <div class="result-level">${scan.level} ppm</div>
                <div class="result-category">${scan.category.toUpperCase()} Level</div>
                <div class="result-confidence">Confidence: ${scan.confidence}%</div>
                <button onclick="this.parentElement.parentElement.style.display='none'">Close</button>
            </div>
        `;
        resultElement.style.display = 'block';
    }

    // ============ UTILITY FUNCTIONS ============

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    updateElement(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = content;
        }
    }

    setupTabNavigation() {
        // Enhanced tab navigation that preserves the existing functionality
        window.showTab = (tabName) => {
            document.querySelectorAll('.page-section').forEach(section => {
                section.classList.remove('active');
            });
            
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            const targetSection = document.getElementById(tabName);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            const activeTab = document.querySelector(`[onclick="showTab('${tabName}')"]`);
            if (activeTab) {
                activeTab.classList.add('active');
            }

            // Update tab content when switched
            switch (tabName) {
                case 'overview':
                    this.updateOverviewTab();
                    break;
                case 'history':
                    this.updateHistoryTab();
                    break;
                case 'tips':
                    this.updateTipsTab();
                    break;
            }
        };
    }

    // ============ STORAGE FUNCTIONS ============

    saveScans(scans) {
        this.setInStorage('microplastics_scans', scans);
    }

    saveChallenges(challenges) {
        this.setInStorage('microplastics_challenges', challenges);
    }

    saveSettings(settings) {
        this.setInStorage('microplastics_settings', settings);
        this.settings = settings;
    }

    getFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || null;
        } catch (e) {
            console.warn(`Error loading ${key} from storage:`, e);
            return null;
        }
    }

    setInStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Error saving ${key} to storage:`, e);
        }
    }
}

// ============ GLOBAL FUNCTIONS ============

// Keep existing navigation functions
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

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Show scan details modal
function showScanDetails(scanId) {
    const scan = app.scans.find(s => s.id === scanId);
    if (!scan) return;

    const modal = document.createElement('div');
    modal.className = 'scan-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal" onclick="this.parentElement.parentElement.remove()">×</button>
            <h3>${scan.name}</h3>
            <div class="scan-detail-grid">
                <div class="detail-item">
                    <label>Level:</label>
                    <span class="${scan.category}">${scan.level.toFixed(1)} ppm</span>
                </div>
                <div class="detail-item">
                    <label>Category:</label>
                    <span>${scan.category.toUpperCase()}</span>
                </div>
                <div class="detail-item">
                    <label>Date:</label>
                    <span>${new Date(scan.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="detail-item">
                    <label>Location:</label>
                    <span>${scan.location}</span>
                </div>
                <div class="detail-item">
                    <label>Confidence:</label>
                    <span>${scan.confidence}%</span>
                </div>
                ${scan.notes ? `<div class="detail-item full-width"><label>Notes:</label><span>${scan.notes}</span></div>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Global app instance
let app;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new MicroplasticsDataManager();
});

// Handle hash navigation for tabs (keep existing functionality)
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && ['overview', 'history', 'tips'].includes(hash)) {
        if (typeof showTab === 'function') {
            showTab(hash);
        }
    } else if (typeof showTab === 'function') {
        showTab('overview');
    }
});

// Export for other scripts if needed
window.MicroplasticsApp = {
    getData: () => app,
    addScan: (data) => app.addScan(data),
    getScans: () => app.scans,
    getChallenges: () => app.challenges
};