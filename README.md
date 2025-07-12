# 🥋 BJJ Tracker

A comprehensive mobile-first web application for tracking Brazilian Jiu-Jitsu training sessions, submissions, and learning techniques.

## ✨ Features

### 📊 Training Tracking
- **Mat Hours Logging**: Track training time with decimal precision (e.g., 1.5 hours)
- **Submission Tracking**: Log submissions you got vs. submissions done on you
- **Dropdown Selection**: Choose from 25+ common BJJ submissions instead of typing
- **Training Notes**: Add detailed notes about techniques worked on, partners, etc.
- **Date-based Organization**: Entries grouped by date with newest first
- **Edit & Delete**: Modify existing entries or remove incorrect data
- **Local Storage**: All data persists between sessions

### 📚 Learning Section
- **Comprehensive Technique Library**: Organized by categories and subcategories
- **Search Functionality**: Find techniques quickly across all categories
- **Collapsible Categories**: Clean, organized navigation
- **Categories Include**:
  - Guard (Closed, Open, Half)
  - Side Control (Escapes, Submissions)
  - Mount (Escapes, Submissions)
  - Back Control (Submissions, Control)
  - Takedowns (Single Leg, Double Leg, Throws)
  - Leg Locks (Heel Hooks, Ankle Locks, Knee Bars)

### 📈 Analytics Dashboard
- **Overview Statistics**: Total mat hours, sessions, average session length, submission ratio
- **Hollow Pie Chart**: Visual representation of submissions given vs. received
- **Recent Trends**: Last 4 weeks of training data
- **Weekly Hours Chart**: Visual progress bars showing training consistency
- **Top Submissions**: Your most successful moves and common weaknesses
- **Real-time Calculations**: All analytics update automatically

### 🎨 Design Features
- **Mobile-First**: Optimized for mobile devices with responsive design
- **Modern UI**: Gradient backgrounds, card-based design, smooth animations
- **Touch-Friendly**: Large buttons and intuitive interactions
- **PWA Ready**: Can be installed as a progressive web app
- **Accessibility**: Proper focus states and semantic HTML

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bjj-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## 📱 Usage Guide

### Adding Training Entries

1. **Navigate to Tracking Section**
   - Click the "📊 Tracking" tab

2. **Add New Entry**
   - Click the "+ Add Entry" button
   - Fill in the date, mat hours, submissions, and notes
   - Use the dropdown to select submissions from the predefined list
   - Click "Save Entry"

3. **Editing Entries**
   - Click the ✏️ edit button on any entry
   - Modify the data as needed
   - Click "Update Entry" to save changes

4. **Deleting Entries**
   - Click the 🗑️ delete button on any entry
   - Confirm the deletion

### Using the Learning Section

1. **Browse Techniques**
   - Click the "📚 Learning" tab
   - Expand categories to see subcategories
   - Click on subcategories to view techniques

2. **Search Techniques**
   - Use the search bar to find specific techniques
   - Results show technique name and category

### Viewing Analytics

1. **Access Analytics**
   - Click the "📈 Analytics" tab

2. **Review Statistics**
   - View overview cards with key metrics
   - Examine the pie chart for submission ratio
   - Check recent trends and weekly progress
   - Review top submissions analysis

## 🛠️ Technical Details

### Built With
- **React 19**: Modern React with hooks
- **CSS3**: Custom styling with Flexbox and Grid
- **Local Storage**: Client-side data persistence
- **SVG**: Custom pie chart implementation
- **Progressive Web App**: Mobile installation support

### Project Structure
```
bjj-tracker/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── TrackingSection.js
│   │   ├── TrackingSection.css
│   │   ├── LearningSection.js
│   │   ├── LearningSection.css
│   │   ├── AnalyticsSection.js
│   │   └── AnalyticsSection.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

### Data Structure
Training entries are stored with the following structure:
```javascript
{
  id: Date.now(),
  date: "2024-01-15",
  matHours: "1.5",
  submissionsGot: ["Triangle Choke", "Armbar"],
  submissionsReceived: ["Guillotine Choke"],
  notes: "Worked on guard retention..."
}
```

## 📊 Available Submissions

The app includes 25+ common BJJ submissions:

**Chokes:**
- Triangle Choke, Guillotine Choke, Rear Naked Choke, Cross Collar Choke, Bow and Arrow Choke, North South Choke, Paper Cutter Choke, Arm Triangle, Anaconda Choke, D'Arce Choke, Peruvian Necktie, Gogoplata

**Joint Locks:**
- Armbar, Kimura, Americana, Omoplata

**Leg Locks:**
- Heel Hook, Ankle Lock, Kneebar, Straight Ankle Lock, Achilles Lock, Inside Heel Hook, Outside Heel Hook, Calf Slicer

## 🎯 Key Features

### Data Persistence
- All training data is automatically saved to localStorage
- No backend required - works completely offline
- Data persists between browser sessions

### Mobile Optimization
- Responsive design that works on all screen sizes
- Touch-friendly interface optimized for mobile devices
- Can be installed as a PWA on mobile devices

### Performance
- Efficient React components with proper memoization
- Optimized calculations for analytics
- Smooth animations and transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for the BJJ community to track training progress
- Inspired by the need for better training session tracking
- Designed with mobile-first approach for on-the-go usage

---

**Happy Training! 🥋**
