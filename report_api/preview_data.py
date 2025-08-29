import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

def preview_ei_data(excel_file="ei_assessment_data.xlsx"):
    """Preview the generated EI assessment data"""
    
    try:
        # Read the data
        df = pd.read_excel(excel_file)
        
        print("=" * 60)
        print("EMOTIONAL INTELLIGENCE ASSESSMENT DATA PREVIEW")
        print("=" * 60)
        
        print(f"\n📊 Dataset Overview:")
        print(f"   Total People: {len(df)}")
        print(f"   Total Parameters: {len(df.columns)}")
        print(f"   Assessment Years: {sorted(df['Vintage'].unique())}")
        
        print(f"\n📋 Parameters Included:")
        for i, col in enumerate(df.columns, 1):
            print(f"   {i:2d}. {col}")
        
        print(f"\n📈 Sample Statistics:")
        print(df.describe().round(2))
        
        print(f"\n👥 Sample Data (First 5 people):")
        print(df.head().round(2))
        
        # Create a summary visualization
        plt.figure(figsize=(15, 10))
        
        # 1. Overall EI Score distribution
        plt.subplot(2, 2, 1)
        plt.hist(df['EI Score'], bins=10, color='skyblue', alpha=0.7, edgecolor='black')
        plt.title('Distribution of Overall EI Scores')
        plt.xlabel('EI Score')
        plt.ylabel('Frequency')
        
        # 2. Average scores by component
        plt.subplot(2, 2, 2)
        ei_components = [col for col in df.columns if '%' in col and 'Stress' not in col and 'Calmness' not in col and 'Mood' not in col]
        avg_scores = df[ei_components].mean().sort_values(ascending=True)
        
        plt.barh(range(len(avg_scores)), avg_scores.values, color='lightcoral')
        plt.yticks(range(len(avg_scores)), [col.replace(' (%)', '') for col in avg_scores.index])
        plt.title('Average Scores by EI Component')
        plt.xlabel('Average Score (%)')
        
        # 3. Stress vs Calmness correlation
        plt.subplot(2, 2, 3)
        plt.scatter(df['Stress (%)'], df['Calmness (%)'], alpha=0.6, color='orange')
        plt.xlabel('Stress Level (%)')
        plt.ylabel('Calmness (%)')
        plt.title('Stress vs Calmness Correlation')
        
        # 4. Performance vs EI Score
        plt.subplot(2, 2, 4)
        plt.scatter(df['EI Score'], df['Performance'], alpha=0.6, color='green')
        plt.xlabel('EI Score')
        plt.ylabel('Performance')
        plt.title('Performance vs EI Score')
        
        plt.tight_layout()
        plt.savefig('data_preview.png', dpi=300, bbox_inches='tight')
        print(f"\n📊 Visualization saved as 'data_preview.png'")
        
        # Show correlations
        print(f"\n🔗 Key Correlations:")
        correlations = df[['EI Score', 'Performance', 'Emotional Regulation Score', 'Stress (%)', 'Calmness (%)']].corr()
        print(correlations.round(3))
        
        print(f"\n✅ Data preview completed!")
        
    except FileNotFoundError:
        print(f"❌ File {excel_file} not found. Please run generate_ei_reports.py first.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    preview_ei_data() 