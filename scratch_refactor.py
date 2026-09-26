import re
import sys

def modify_file():
    with open("src/app/dashboard/inspections/page.tsx", "r", encoding="utf-8") as f:
        content = f.read()

    # Split the file exactly at line 356 which is `<div className="grid gap-6 md:grid-cols-2">`
    # We can use a regex to find this safely.
    match = re.search(r'<div className="grid gap-6 md:grid-cols-2">\s*{/\* Section 1: Coordinated Inspections', content)
    if not match:
        print("Could not find the target section")
        return
    
    prefix = content[:match.start()]
    suffix = content[match.start():]
    
    # In the suffix, we need to locate the Dialog block (from `<Dialog open={rescheduleOpen}` to `</Dialog>`)
    dialog_match = re.search(r'<Dialog open={rescheduleOpen}.*?</Dialog>', suffix, re.DOTALL)
    if not dialog_match:
        print("Could not find Dialog")
        return
        
    dialog_code = dialog_match.group(0)
    
    # We need to extract the new Section 2
    # Section 2 starts at `{/* Section 2: Remote/Video Verification */}`
    s2_match = re.search(r'{/\* Section 2: Remote/Video Verification \*/}.*?</Card>', suffix, re.DOTALL)
    if not s2_match:
        print("Could not find Section 2")
        return
        
    s2_code = s2_match.group(0)
    
    # In s2_code, remove the Dialog since we're pulling it out. We replace it with nothing or a placeholder
    s2_code_no_dialog = s2_code.replace(dialog_code, '')
    
    # Build the final code
    # 1. Add the conditionally rendered Section 2
    # 2. Add the Dialog at the bottom
    new_bottom = f"""
      {{jointInspections.length === 0 && schedule && (
        <div className="max-w-3xl">
          {s2_code_no_dialog}
        </div>
      )}}

      {dialog_code}
    </div>
  );
}}
"""
    
    final_content = prefix + new_bottom
    
    with open("src/app/dashboard/inspections/page.tsx", "w", encoding="utf-8") as f:
        f.write(final_content)
        
    print("Successfully modified the file.")

if __name__ == "__main__":
    modify_file()
