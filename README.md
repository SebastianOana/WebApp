# Income Calculator Desktop App

A modern, native-looking desktop application built with Electron for calculating income, taxes, and tracking expenses. Perfect for freelancers, contractors, and anyone who needs to quickly calculate their earnings.

## Features

### 💰 Hourly Rate Calculator
- Calculate daily, weekly, monthly, and annual income
- Customizable working days per week
- Real-time calculations as you type

### 💼 Salary Calculator
- Convert annual salary to various pay periods
- Support for weekly, bi-weekly, and monthly pay schedules
- Comprehensive income breakdown

### 🧮 Tax Calculator
- Estimate tax amounts based on income and tax rate
- Calculate net income after taxes
- Shows effective tax rate

### 📊 Expense Tracker
- Add and remove monthly expenses dynamically
- Track multiple expense categories
- Calculate remaining income after expenses

### 📈 Financial Summary
- Real-time overview of all calculations
- Weekly, monthly, and annual income summary
- After-tax income estimates

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Open terminal in the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
This runs the app in development mode with DevTools enabled.

#### Production Mode
```bash
npm start
```

### Building for Distribution

#### Build for Windows
```bash
npm run build-win
```

#### Build for all platforms
```bash
npm run build
```

Built applications will be available in the `dist` folder.

## Usage

1. **Hourly Calculator**: Enter your hourly rate, hours worked, and working days per week
2. **Salary Calculator**: Input your annual salary and select pay period
3. **Tax Calculator**: Enter gross income and tax rate for estimates
4. **Expenses**: Add your monthly expenses to track spending
5. **Summary**: View your complete financial overview at the bottom

## Keyboard Shortcuts

- `Ctrl+N` (or `Cmd+N` on Mac): Clear all calculations and start fresh
- `Enter`: Calculate when focused on input fields

## Technology Stack

- **Electron**: Cross-platform desktop app framework
- **HTML5/CSS3**: Modern web technologies for UI
- **JavaScript (ES6+)**: Application logic and interactions
- **Electron Builder**: Application packaging and distribution

## Project Structure

```
income-calculator/
├── main.js                 # Main Electron process
├── package.json            # Project configuration
├── src/
│   ├── index.html          # Application interface
│   ├── styles.css          # Styling and layout
│   └── calculator.js       # Calculator logic
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## Contributing

Feel free to fork this project and submit pull requests for improvements. Some ideas for enhancements:

- Add data persistence to save calculations
- Include more tax calculation options
- Add investment and savings calculators
- Implement currency conversion
- Add data export features

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.
