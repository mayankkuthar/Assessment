# 📊 Report Visibility Logic Update

## Overview
Updated the ReportViewer component to conditionally show/hide sections based on quiz type. The **EQ Score Card** and **Detailed Analysis** sections now automatically hide for personality quizzes and show for all other assessment types.

## ✨ Changes Made

### **1. EQ Score Card Section**
**Location:** `src/components/ReportViewer.jsx` - Line ~885

**Before:**
```javascript
{template?.charts?.enabled && packetScores.length > 0 && (
  <Card>
    {/* EQ Score Card content */}
  </Card>
)}
```

**After:**
```javascript
{template?.charts?.enabled && packetScores.length > 0 && !quiz?.name?.toLowerCase().includes('personality') && (
  <Card>
    {/* EQ Score Card content */}
  </Card>
)}
```

**Condition:** 
- ✅ **SHOW** when: Quiz name does NOT contain "personality"
- ❌ **HIDE** when: Quiz name contains "personality" (case-insensitive)

---

### **2. Detailed Analysis Section**
**Location:** `src/components/ReportViewer.jsx` - Line ~1138

**Before:**
```javascript
{template?.sectionAnalysis?.enabled && (
  <Card>
    {/* Detailed Analysis content */}
  </Card>
)}
```

**After:**
```javascript
{template?.sectionAnalysis?.enabled && !quiz?.name?.toLowerCase().includes('personality') && (
  <Card>
    {/* Detailed Analysis content */}
  </Card>
)}
```

**Condition:** 
- ✅ **SHOW** when: Quiz name does NOT contain "personality"
- ❌ **HIDE** when: Quiz name contains "personality" (case-insensitive)

---

### **3. Personality Analysis Section**
**Location:** `src/components/ReportViewer.jsx` - Line ~986

**Already has built-in detection:**
```javascript
{template?.sectionAnalysis?.enabled && packetScores.length > 0 && (() => {
  const personalityTypes = [
    'Paranoid', 'Dissocial', 'Impulsive', 'Borderline', 
    'Histrionic', 'Anankastic', 'Anxious', 'Dependent'
  ];
  
  const isPersonalityQuiz = packetScores.some(p => 
    personalityTypes.some(type => 
      p.name.toLowerCase().includes(type.toLowerCase())
    )
  );
  
  if (!isPersonalityQuiz) return null;
  
  // Render Personality Analysis
})()}
```

**Condition:**
- ✅ **SHOW** when: Packet names match personality types
- ❌ **HIDE** when: No personality-type packets detected

---

## 🎯 Report Display Logic

### **For Personality Quizzes:**

```
Quiz Name: "Personality Assessment"
│
├─ ❌ EQ Score Card → HIDDEN
├─ ❌ Detailed Analysis → HIDDEN
└─ ✅ Personality Analysis → SHOWN
   ├─ 🥇 Primary Personality
   └─ 🥈 Secondary Personality
```

### **For EQ/Other Quizzes:**

```
Quiz Name: "Emotional Intelligence Test"
│
├─ ✅ EQ Score Card → SHOWN
├─ ✅ Detailed Analysis → SHOWN
└─ ❌ Personality Analysis → HIDDEN
```

---

## 📋 Examples

### **Example 1: Personality Quiz**

**Quiz Details:**
- Name: "Comprehensive Personality Quiz"
- Packets: ["Histrionic", "Impulsive", "Anxious"]

**Report Shows:**
```
✅ Header Information
✅ User Details
✅ Overall Performance
❌ EQ Score Card (HIDDEN)
✅ Personality Analysis (SHOWN)
   🥇 Primary: Histrionic
   🥈 Secondary: Impulsive
❌ Detailed Analysis (HIDDEN)
✅ Footer
```

### **Example 2: EQ Quiz**

**Quiz Details:**
- Name: "Emotional Intelligence Assessment"
- Packets: ["Self Awareness", "Empathy", "Social Skills"]

**Report Shows:**
```
✅ Header Information
✅ User Details
✅ Overall Performance
✅ EQ Score Card (SHOWN)
   📊 Parameter Wise Scores
   📈 Charts
❌ Personality Analysis (HIDDEN)
✅ Detailed Analysis (SHOWN)
   📘 All packets with insights
✅ Footer
```

### **Example 3: Mixed Quiz**

**Quiz Details:**
- Name: "My Custom Quiz"
- Packets: ["Math", "Science", "History"]

**Report Shows:**
```
✅ Header Information
✅ User Details
✅ Overall Performance
✅ EQ Score Card (SHOWN - name doesn't include "personality")
❌ Personality Analysis (HIDDEN - no personality packets)
✅ Detailed Analysis (SHOWN - name doesn't include "personality")
✅ Footer
```

---

## 🔍 Detection Methods

### **Dual Detection System:**

**1. Quiz Name Detection (Primary)**
```javascript
!quiz?.name?.toLowerCase().includes('personality')
```
- Checks if quiz name contains "personality"
- Case-insensitive matching
- Hides EQ sections if found

**2. Packet Name Detection (Secondary)**
```javascript
const personalityTypes = [...];
const isPersonalityQuiz = packetScores.some(p => 
  personalityTypes.some(type => 
    p.name.toLowerCase().includes(type.toLowerCase())
  )
);
```
- Checks if any packet matches known personality types
- Only shows Personality Analysis if matched
- Independent of quiz name

### **Why Both?**

**Scenario: Misnamed Quiz**
```
Quiz Name: "My Assessment" (doesn't say "personality")
Packets: ["Paranoid", "Borderline", "Histrionic"]

Result:
❌ EQ Score Card → SHOWN (name doesn't say "personality")
✅ Personality Analysis → SHOWN (packets match)
✅ Detailed Analysis → SHOWN (name doesn't say "personality")

User sees both EQ and Personality sections
```

**Recommendation:** Always name personality quizzes with "personality" in the title for best results.

---

## 🎨 User Experience

### **Personality Quiz Report:**

```
╔═══════════════════════════════════════════╗
║  🎭 Personality Analysis                  ║
║                                           ║
║  🥇 Primary: Histrionic (18/20)           ║
║  📝 Full description...                   ║
║                                           ║
║  🥈 Secondary: Impulsive (15/20)          ║
║  📝 Full description...                   ║
╚═══════════════════════════════════════════╝

Clean, focused report with just personality insights
```

### **EQ Quiz Report:**

```
╔═══════════════════════════════════════════╗
║  📊 EQ Score Card                         ║
║                                           ║
║  📊 Parameter Wise Scores                 ║
║  [Charts showing all parameters]          ║
╚═══════════════════════════════════════════╝

╔═══════════════════════════════════════════╗
║  🔍 Detailed Analysis                     ║
║                                           ║
║  📘 Self Awareness                        ║
║  📝 Insights text...                      ║
║                                           ║
║  📘 Empathy                               ║
║  📝 Insights text...                      ║
╚═══════════════════════════════════════════╝

Comprehensive EQ breakdown with detailed analysis
```

---

## 🛠️ Technical Details

### **Conditional Rendering Logic:**

```javascript
// Section visibility matrix
const showEQScoreCard = template?.charts?.enabled && 
                        packetScores.length > 0 && 
                        !quiz?.name?.toLowerCase().includes('personality');

const showDetailedAnalysis = template?.sectionAnalysis?.enabled && 
                             !quiz?.name?.toLowerCase().includes('personality');

const showPersonalityAnalysis = template?.sectionAnalysis?.enabled && 
                                packetScores.length > 0 && 
                                hasPersonalityPackets(packetScores);
```

### **Implementation Notes:**

1. **Safe Navigation:** Uses optional chaining (`?.`) to prevent errors
2. **Case Insensitive:** `.toLowerCase()` ensures matching regardless of case
3. **Performance:** Minimal impact - simple string checks
4. **Maintainability:** Clear, readable conditions

---

## 🔄 Backward Compatibility

### **Existing Quizzes:**

**Non-Personality Quizzes:**
- ✅ Continue to show EQ Score Card
- ✅ Continue to show Detailed Analysis
- ✅ No changes to existing behavior

**Personality Quizzes:**
- ✅ Automatically hide EQ sections
- ✅ Show Personality Analysis instead
- ✅ Cleaner, more relevant reports

### **New Quizzes:**

Simply include "personality" in the quiz name:
```
✅ "Personality Assessment" → Shows personality analysis
✅ "My Personality Quiz" → Shows personality analysis
❌ "Leadership Quiz" → Shows EQ sections
❌ "Communication Skills" → Shows EQ sections
```

---

## 📊 Summary Table

| Quiz Type | EQ Score Card | Detailed Analysis | Personality Analysis |
|-----------|---------------|-------------------|---------------------|
| **Personality Quiz** | ❌ Hidden | ❌ Hidden | ✅ Shown |
| **EQ Quiz** | ✅ Shown | ✅ Shown | ❌ Hidden |
| **Skills Quiz** | ✅ Shown | ✅ Shown | ❌ Hidden |
| **Knowledge Test** | ✅ Shown | ✅ Shown | ❌ Hidden |

---

## 🎯 Best Practices

### **Naming Conventions:**

**For Personality Quizzes:**
- ✅ Include "personality" in the name
- ✅ Examples:
  - "Personality Assessment"
  - "My Personality Quiz"
  - "Comprehensive Personality Inventory"

**For Other Quizzes:**
- ✅ Avoid using "personality" in the name
- ✅ Examples:
  - "Emotional Intelligence Test"
  - "Communication Skills Assessment"
  - "Leadership Capability Quiz"

---

## 🆘 Troubleshooting

### **Q: EQ sections still showing for personality quiz?**

**A:** Check these:
1. Does quiz name contain "personality"? (case-insensitive)
2. Try renaming: "My Quiz" → "My Personality Quiz"
3. Refresh the report after renaming

### **Q: Personality analysis not showing?**

**A:** Verify:
1. Packet names must match personality types
2. At least one packet should contain: Paranoid, Dissocial, Impulsive, Borderline, Histrionic, Anankastic, Anxious, or Dependent
3. Template must have `sectionAnalysis.enabled = true`

### **Q: Can I override this behavior?**

**A:** Yes! Modify the conditions:
```javascript
// Force show EQ Score Card
{true && (  // Always show
  <Card>...</Card>
)}

// Force hide based on custom logic
{!customCondition && (
  <Card>...</Card>
)}
```

---

## 📝 Code Quality

### **Improvements:**
- ✅ Clear conditional logic
- ✅ Consistent pattern across sections
- ✅ Safe navigation operators
- ✅ Case-insensitive matching
- ✅ No breaking changes

### **Maintainability:**
- ✅ Easy to understand conditions
- ✅ Simple to modify if needed
- ✅ Follows React best practices
- ✅ Well-documented behavior

---

**Implementation Date:** March 24, 2026  
**Version:** 1.1 - Report Visibility Logic  
**Location:** `src/components/ReportViewer.jsx`  
**Status:** ✅ Production Ready
