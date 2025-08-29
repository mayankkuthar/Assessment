import pandas as pd
import os
from generate_ei_reports import EmotionalIntelligenceReport

def generate_reports_from_excel(excel_file_path, output_folder="reports_from_excel"):
    """
    Generate EI reports from existing Excel data
    
    Args:
        excel_file_path (str): Path to the Excel file containing EI assessment data
        output_folder (str): Folder to save the generated reports
    """
    
    # Read the Excel file
    print(f"Reading data from {excel_file_path}...")
    try:
        df = pd.read_excel(excel_file_path)
        print(f"Successfully loaded data with {len(df)} people")
        print(f"Columns found: {list(df.columns)}")
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return
    
    # Create output directory
    os.makedirs(output_folder, exist_ok=True)
    os.makedirs('temp_charts', exist_ok=True)
    
    # Create report generator
    ei_reporter = EmotionalIntelligenceReport()
    
    print(f"Generating reports in {output_folder}...")
    
    # Generate reports for each person
    for index, row in df.iterrows():
        person_name = row['Name'] if 'Name' in row else f"Person_{index+1}"
        print(f"Processing {person_name}...")
        
        try:
            # Create charts for this person
            charts = ei_reporter.create_charts(row, person_name)
            chart_files = ei_reporter.save_charts(charts, person_name)
            
            # Generate PDF with charts
            pdf = ei_reporter.generate_pdf_report(row, person_name, chart_files)
            
            # Save PDF
            pdf_filename = f"{output_folder}/{person_name}_EI_Report.pdf"
            pdf.output(pdf_filename)
            
            # Clean up chart files
            for chart_file in chart_files:
                if os.path.exists(chart_file):
                    os.remove(chart_file)
            
        except Exception as e:
            print(f"Error generating report for {person_name}: {e}")
            continue
    
    # Clean up temp directory
    if os.path.exists('temp_charts') and not os.listdir('temp_charts'):
        os.rmdir('temp_charts')
    
    print(f"\n✅ Successfully generated {len(df)} reports!")
    print(f"📁 Reports saved in: {output_folder}/")

if __name__ == "__main__":
    # Example usage - generate reports from the dummy data we created
    excel_file = "ei_assessment_data.xlsx"
    
    if os.path.exists(excel_file):
        generate_reports_from_excel(excel_file, "reports_from_excel")
    else:
        print(f"Excel file {excel_file} not found. Please run generate_ei_reports.py first to create dummy data.")
        
    # You can also use this with your own Excel file:
    # generate_reports_from_excel("your_data.xlsx", "your_reports") 