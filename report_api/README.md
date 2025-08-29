# Emotional Intelligence Assessment Report Generator

This Python program generates professional PDF reports for emotional intelligence assessments. It creates dummy data with various EI parameters and generates individual reports with charts, analysis, and recommendations.

## Features

- **Dummy Data Generation**: Creates realistic emotional intelligence assessment data
- **Professional PDF Reports**: Generates detailed reports for each person
- **Multiple Chart Types**: Bar charts, radar charts, and stress management profiles
- **Score Interpretation**: Automatic interpretation of scores with recommendations
- **Professional Styling**: Clean, professional design with color-coded elements

## Parameters Included

- Self Awareness (%)
- Managing Emotions (%)
- Motivating Oneself (%)
- Empathy (%)
- Social Skills (%)
- Self Perception (%)
- Self Expression (%)
- Inter Personal (%)
- Decision Making (%)
- Stress Management (%)
- Stress (%)
- Calmness (%)
- Mood Management (%)
- Performance
- Emotional Regulation Score
- EI Score
- Vintage

## Installation

1. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the program**:
   ```bash
   python generate_ei_reports.py
   ```

## Output

The program will generate:

1. **`ei_assessment_data.xlsx`** - Excel file containing all dummy data
2. **`reports/`** folder - Contains individual PDF reports for each person
   - `Person_1_EI_Report.pdf`
   - `Person_2_EI_Report.pdf`
   - ... and so on

## Report Contents

Each PDF report includes:

- **Header**: Professional title and person information
- **Overall EI Score**: Main score with interpretation
- **Key Metrics Table**: Performance, emotional regulation, stress, and calmness
- **Detailed Component Analysis**: All EI components with scores and interpretations
- **Recommendations**: Personalized development suggestions based on scores
- **Charts**: Visual representations of the data (generated separately)

## Customization

You can modify the program to:

- Change the number of people (default: 20)
- Adjust score ranges and distributions
- Modify color schemes
- Add custom interpretations
- Include additional chart types

## Score Interpretation Ranges

- **80-100%**: Excellent - Significant strength
- **70-79%**: Good - Well developed
- **60-69%**: Average - Room for improvement
- **50-59%**: Below Average - Needs attention
- **Below 50%**: Needs Improvement - Requires focused development

## Requirements

- Python 3.7+
- All packages listed in `requirements.txt`
- Sufficient disk space for PDF generation

## Usage Example

```python
from generate_ei_reports import EmotionalIntelligenceReport

# Create report generator
ei_reporter = EmotionalIntelligenceReport()

# Generate reports for 10 people
ei_reporter.generate_all_reports(10)
```

## Troubleshooting

- **Font Issues**: The program uses Arial fonts. If you encounter font errors, ensure Arial is available on your system
- **Chart Generation**: Make sure matplotlib backend is properly configured
- **PDF Generation**: Ensure you have write permissions in the current directory

## License

This project is open source and available under the MIT License. 