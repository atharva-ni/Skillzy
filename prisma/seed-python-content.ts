import { PrismaClient, LessonStepType, AssignmentType, AssignmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create a unique ID for steps
function makeStepId(lessonId: string, type: string) {
  // Use a predictable slug based on lesson UUID and type
  return `${lessonId.substring(0, 18)}-${type}`;
}

async function main() {
  console.log('🌱 Starting Python Course Content Seeding...');

  // 1. Locate the Python Programming Course
  const course = await prisma.course.findFirst({
    where: { slug: 'python-programming-course' }
  });

  if (!course) {
    console.error('Error: Python Programming Course not found in database!');
    process.exit(1);
  }
  console.log(`Found Course: "${course.title}" (ID: ${course.id})`);

  // 2. Fetch all modules and lessons
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    include: {
      lessons: {
        include: {
          steps: true
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  console.log(`Fetched ${modules.length} modules.`);

  // 3. Define content maps for key coding labs
  const labsMap: Record<string, {
    title: string;
    starterCode: string;
    solutionCode: string;
    instructions: string;
    testCode: string;
  }> = {
    "Variables": {
      title: "Lab - Creating and Summing Variables",
      starterCode: `def sum_variables():
    # TODO: Create a variable 'x' with the value 10
    # TODO: Create a variable 'y' with the value 20
    # Return their sum
    pass
`,
      solutionCode: `def sum_variables():
    x = 10
    y = 20
    return x + y
`,
      instructions: `### Interactive Lab: Creating Variables

In this lab, you will practice basic variable creation and assignment:
1. Define a variable \`x\` and assign it the integer value \`10\`.
2. Define a variable \`y\` and assign it the integer value \`20\`.
3. Return the sum of \`x\` and \`y\`.`,
      testCode: `
try:
    if 'sum_variables' not in globals():
        raise NameError("Function sum_variables is not defined")
    act = sum_variables()
    passed = act == 30
    print(f"[TEST_CASE] 0 | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed:
        print("TEST_RESULTS: 1/1 passed")
    else:
        print("TEST_FAILURE: 1 test case failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Dynamic Typing": {
      title: "Lab - Identifying Variable Types",
      starterCode: `def get_type_string(val):
    # TODO: Return a string representing the type of 'val'.
    # Return "int" for integers, "float" for floats, "str" for strings, and "bool" for booleans.
    pass
`,
      solutionCode: `def get_type_string(val):
    if isinstance(val, bool):
        return "bool"
    elif isinstance(val, int):
        return "int"
    elif isinstance(val, float):
        return "float"
    elif isinstance(val, str):
        return "str"
    return "unknown"
`,
      instructions: `### Interactive Lab: Dynamic Typing

Python is dynamically typed. Write a helper function \`get_type_string\` that:
1. Returns \`"int"\` if \`val\` is an integer.
2. Returns \`"float"\` if \`val\` is a decimal/float.
3. Returns \`"str"\` if \`val\` is a string.
4. Returns \`"bool"\` if \`val\` is a boolean.

*Hint: Use \`isinstance(val, type)\` or \`type(val)\`.*`,
      testCode: `
try:
    if 'get_type_string' not in globals():
        raise NameError("Function get_type_string is not defined")
    cases = [
        { "input": 42, "expected": "int" },
        { "input": 3.14, "expected": "float" },
        { "input": "hello", "expected": "str" },
        { "input": True, "expected": "bool" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = get_type_string(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Arithmetic Operators": {
      title: "Lab - Writing a Simple Calculator",
      starterCode: `def calculator(a, b, op):
    # TODO: Perform calculation of a and b based on the operator 'op'.
    # Supported operators: '+', '-', '*', '/'
    # Return the float or integer result.
    pass
`,
      solutionCode: `def calculator(a, b, op):
    if op == '+':
        return a + b
    elif op == '-':
        return a - b
    elif op == '*':
        return a * b
    elif op == '/':
        return a / b
    return None
`,
      instructions: `### Interactive Lab: Arithmetic Operators

Create a simple calculator function \`calculator(a, b, op)\` that:
1. Performs addition if \`op\` is \`'+'\`.
2. Performs subtraction if \`op\` is \`'-'\`.
3. Performs multiplication if \`op\` is \`'*'\`.
4. Performs division if \`op\` is \`'/'\`.`,
      testCode: `
try:
    if 'calculator' not in globals():
        raise NameError("Function calculator is not defined")
    cases = [
        { "a": 10, "b": 5, "op": "+", "expected": 15 },
        { "a": 20, "b": 8, "op": "-", "expected": 12 },
        { "a": 4, "b": 3, "op": "*", "expected": 12 },
        { "a": 15, "b": 3, "op": "/", "expected": 5.0 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = calculator(c["a"], c["b"], c["op"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "String Slicing": {
      title: "Lab - Extractor Middle Substring",
      starterCode: `def get_middle_three(s):
      # TODO: Return the middle three characters of the string 's'.
      # Assumes string length is odd and at least 3.
      pass
`,
      solutionCode: `def get_middle_three(s):
    mid = len(s) // 2
    return s[mid - 1: mid + 2]
`,
      instructions: `### Interactive Lab: String Slicing

Slicing allows you to extract sections of strings using indices. Write a function \`get_middle_three(s)\` that:
1. Finds the middle index of string \`s\`.
2. Uses string slicing to return exactly three characters centered around the middle.
   * For example, given \`"Candy"\`, the middle is \`"a"\`, so it returns \`"and"\`.`,
      testCode: `
try:
    if 'get_middle_three' not in globals():
        raise NameError("Function get_middle_three is not defined")
    cases = [
        { "input": "Candy", "expected": "and" },
        { "input": "solving", "expected": "lvi" },
        { "input": "abc", "expected": "abc" }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = get_middle_three(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Lists": {
      title: "Lab - Array Extremes Difference",
      starterCode: `def min_max_diff(nums):
    # TODO: Find the minimum and maximum integers in the list 'nums'.
    # Return their difference (max_value - min_value).
    # Return 0 if the list is empty.
    pass
`,
      solutionCode: `def min_max_diff(nums):
    if not nums:
        return 0
    return max(nums) - min(nums)
`,
      instructions: `### Interactive Lab: Lists Operations

Write a function \`min_max_diff(nums)\` that takes a list of integers and:
1. Finds the maximum value in the list.
2. Finds the minimum value in the list.
3. Returns the difference (\`max - min\`).
4. Handles empty lists by returning \`0\`.`,
      testCode: `
try:
    if 'min_max_diff' not in globals():
        raise NameError("Function min_max_diff is not defined")
    cases = [
        { "input": [1, 5, 3, 9, 2], "expected": 8 },
        { "input": [-10, 0, 10], "expected": 20 },
        { "input": [], "expected": 0 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = min_max_diff(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Dictionaries": {
      title: "Lab - Character Counter",
      starterCode: `def count_characters(s):
    # TODO: Return a dictionary counting the occurrence of each character in string 's'.
    # Spaces and special signs should be counted.
    pass
`,
      solutionCode: `def count_characters(s):
    counts = {}
    for char in s:
        counts[char] = counts.get(char, 0) + 1
    return counts
`,
      instructions: `### Interactive Lab: Dictionary Mapping

Write a function \`count_characters(s)\` that builds a frequency dictionary:
1. Iterate over every character in string \`s\`.
2. Store character counts in a dictionary where the keys are characters and values are their frequency.
3. Return the dictionary.`,
      testCode: `
try:
    if 'count_characters' not in globals():
        raise NameError("Function count_characters is not defined")
    cases = [
        { "input": "aba", "expected": {"a": 2, "b": 1} },
        { "input": "code", "expected": {"c": 1, "o": 1, "d": 1, "e": 1} }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = count_characters(c["input"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "if-else statement": {
      title: "Lab - Leap Year Checker",
      starterCode: `def is_leap_year(year):
    # TODO: Return True if 'year' is a leap year, otherwise False.
    # Rules: divisible by 4, but not by 100 unless also divisible by 400.
    pass
`,
      solutionCode: `def is_leap_year(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0
`,
      instructions: `### Interactive Lab: Conditional Branches

Implement the leap year checker function \`is_leap_year(year)\`:
1. A year is a leap year if it is divisible by \`4\`.
2. However, years divisible by \`100\` are NOT leap years, unless they are also divisible by \`400\`.
3. Return \`True\` or \`False\`.`,
      testCode: `
try:
    if 'is_leap_year' not in globals():
        raise NameError("Function is_leap_year is not defined")
    cases = [
        { "year": 2000, "expected": True },
        { "year": 1900, "expected": False },
        { "year": 2024, "expected": True },
        { "year": 2023, "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = is_leap_year(c["year"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "for loops": {
      title: "Lab - Summing Digits",
      starterCode: `def sum_digits(n):
    # TODO: Return the sum of digits of positive integer 'n'.
    # For example, sum_digits(123) should return 6 (1 + 2 + 3).
    pass
`,
      solutionCode: `def sum_digits(n):
    return sum(int(digit) for digit in str(n))
`,
      instructions: `### Interactive Lab: Iteration with For Loops

Implement \`sum_digits(n)\` in Python:
1. Convert the number to a string to access individual characters (digits).
2. Loop over each digit, cast it back to an integer, and sum them.
3. Return the total sum.`,
      testCode: `
try:
    if 'sum_digits' not in globals():
        raise NameError("Function sum_digits is not defined")
    cases = [
        { "n": 123, "expected": 6 },
        { "n": 405, "expected": 9 },
        { "n": 9, "expected": 9 }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = sum_digits(c["n"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Defining Functions": {
      title: "Lab - Prime Number Checker",
      starterCode: `def is_prime(n):
    # TODO: Return True if 'n' is a prime number, otherwise False.
    # Note: prime numbers are integers greater than 1 with no divisors other than 1 and themselves.
    pass
`,
      solutionCode: `def is_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True
`,
      instructions: `### Interactive Lab: Defining Custom Functions

Write a function \`is_prime(n)\` that:
1. Returns \`False\` if \`n\` is less than or equal to \`1\`.
2. Loops from \`2\` up to the square root of \`n\` (inclusive) and checks if any number divides \`n\` evenly.
3. Returns \`False\` if a divisor is found, otherwise \`True\`.`,
      testCode: `
try:
    if 'is_prime' not in globals():
        raise NameError("Function is_prime is not defined")
    cases = [
        { "n": 2, "expected": True },
        { "n": 4, "expected": False },
        { "n": 17, "expected": True },
        { "n": 1, "expected": False }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = is_prime(c["n"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "try statement": {
      title: "Lab - Safe Division Exceptions",
      starterCode: `def safe_divide(a, b):
    # TODO: Return a / b.
    # Handle ZeroDivisionError by returning None.
    pass
`,
      solutionCode: `def safe_divide(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        return None
`,
      instructions: `### Interactive Lab: Error Handling

Write a function \`safe_divide(a, b)\` to gracefully handle division by zero:
1. Wrap the division operation in a \`try\` block.
2. Catch \`ZeroDivisionError\` and return \`None\`.
3. Return the result of \`a / b\` on success.`,
      testCode: `
try:
    if 'safe_divide' not in globals():
        raise NameError("Function safe_divide is not defined")
    cases = [
        { "a": 10, "b": 2, "expected": 5.0 },
        { "a": 10, "b": 0, "expected": None }
    ]
    passed_count = 0
    for idx, c in enumerate(cases):
        act = safe_divide(c["a"], c["b"])
        passed = act == c["expected"]
        if passed: passed_count += 1
        print(f"[TEST_CASE] {idx} | {'PASS' if passed else 'FAIL'} | Actual: {act}")
    if passed_count == len(cases):
        print(f"TEST_RESULTS: {passed_count}/{len(cases)} passed")
    else:
        print(f"TEST_FAILURE: {len(cases) - passed_count} test cases failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    },
    "Constructors": {
      title: "Lab - Person Class Initialization",
      starterCode: `class Person:
    def __init__(self, name, age):
        # TODO: Assign parameter values to instance variables
        pass
        
    def greet(self):
        # TODO: Return greeting string: "Hello, my name is [name] and I am [age] years old."
        pass
`,
      solutionCode: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def greet(self):
        return f"Hello, my name is {self.name} and I am {self.age} years old."
`,
      instructions: `### Interactive Lab: Object Oriented Constructors

Practice constructor initialization by completing the \`Person\` class:
1. Implement the \`__init__\` constructor to set instance variables \`self.name\` and \`self.age\`.
2. Implement the \`greet\` method to return a string of the format: \`"Hello, my name is [name] and I am [age] years old."\``,
      testCode: `
try:
    if 'Person' not in globals():
        raise NameError("Class Person is not defined")
    p = Person("Alice", 25)
    passed = p.name == "Alice" and p.age == 25 and p.greet() == "Hello, my name is Alice and I am 25 years old."
    print(f"[TEST_CASE] 0 | {'PASS' if passed else 'FAIL'} | Actual: {p.greet()}")
    if passed:
        print("TEST_RESULTS: 1/1 passed")
    else:
        print("TEST_FAILURE: 1 test case failed")
except Exception as e:
    import sys
    print(f"TEST_FAILURE: {e}", file=sys.stderr)
    sys.exit(1)
`
    }
  };

  // 4. Seeding Logic: Iterate over modules and lessons
  let totalStepsSeeded = 0;
  let totalAssignmentsSeeded = 0;

  for (const mod of modules) {
    console.log(`Processing Module: "${mod.title}"...`);
    for (const les of mod.lessons) {
      // Find if we have a lab defined for this lesson title
      const labConfig = labsMap[les.title];

      // Filter existing steps
      const hasTextStep = les.steps.some(s => s.stepType === LessonStepType.text || s.stepType === LessonStepType.intro);
      const hasLabStep = les.steps.some(s => s.stepType === LessonStepType.lab);

      // A. If a lab is configured and doesn't exist, seed the Lab Step AND Text Step
      if (labConfig && !hasLabStep) {
        console.log(`  Seeding Lab for Lesson: "${les.title}"`);
        
        // 1. Text Step (Conceptual overview of the lab topic)
        const textStepId = makeStepId(les.id, 'text');
        await prisma.lessonStep.upsert({
          where: { id: textStepId },
          update: {},
          create: {
            id: textStepId,
            lessonId: les.id,
            stepType: LessonStepType.text,
            sortOrder: 1,
            title: `Step 1: Introduction to ${les.title}`,
            textContent: `# Understanding ${les.title}
In this step, we cover the core concepts behind **${les.title}** so that you can complete the subsequent coding lab exercise.

### Concept Overview
Every programmer needs to master **${les.title}**. Make sure you review:
1. Syntax correctness.
2. Common edge cases and performance considerations.
3. Practical application examples.

Next, click on the **Coding Lab** step to test your skills in the compiler terminal!`
          }
        });
        totalStepsSeeded++;

        // 2. Coding Lab Step
        const labStepId = makeStepId(les.id, 'lab');
        await prisma.lessonStep.upsert({
          where: { id: labStepId },
          update: {},
          create: {
            id: labStepId,
            lessonId: les.id,
            stepType: LessonStepType.lab,
            sortOrder: 2,
            title: labConfig.title,
            labLanguage: 'python',
            labStarterCode: labConfig.starterCode,
            labSolutionCode: labConfig.solutionCode,
            labInstructions: labConfig.instructions,
            labTestCode: { python: labConfig.testCode },
            metadata: {
              examples: [
                { input: "See instructions", output: "Matches verification rules" }
              ]
            }
          }
        });
        totalStepsSeeded++;

        // 3. Create backing Assignment for the lab
        await prisma.assignment.upsert({
          where: { id: labStepId },
          update: {},
          create: {
            id: labStepId,
            courseId: course.id,
            moduleId: mod.id,
            title: labConfig.title,
            assignmentType: 'coding',
            status: AssignmentStatus.active,
            maxScore: 100,
            starterCode: labConfig.starterCode,
            language: 'python'
          }
        });
        totalAssignmentsSeeded++;
      }
      
      // B. If no lab is configured, and no text/intro step exists, create a default high-quality Text Step
      else if (!labConfig && !hasTextStep) {
        console.log(`  Seeding Text Step for Lesson: "${les.title}"`);
        const textStepId = makeStepId(les.id, 'text');
        
        // Generate content based on module title
        let explanation = '';
        if (mod.title.includes('Introduction')) {
          explanation = `*   **Python Characteristics**: Simple syntax, interpreted, dynamically typed, and multi-paradigm.
*   **Significance**: Used in Web Dev, Data Science, DevOps, Scripting, and AI.
*   **Execution Model**: Source Code (.py) -> Bytecode (.pyc) -> Python Virtual Machine (PVM).`;
        } else if (mod.title.includes('Variables')) {
          explanation = `*   **Variables**: Pointers to memory locations that hold references to objects (variables do not store values directly in Python).
*   **Dynamic Typing**: You don't declare types. Variables change types on reallocation (e.g. \`x = 10\`, then \`x = "ten"\`).
*   **Naming Rules**: Use snake_case, start with a letter or underscore, and avoid reserved keywords.`;
        } else if (mod.title.includes('Operators')) {
          explanation = `*   **Operators**: Arithmetic (\`+\`, \`-\`, \`*\`, \`/\`, \`//\`, \`%\`, \`**\`), Assignment (\`=\`, \`+=\`), Comparison (\`==\`, \`!=\`, \`>\`), and Logical (\`and\`, \`or\`, \`not\`).
*   **Precedence**: PEMDAS rules govern arithmetic orders.
*   **Membership & Identity**: Use \`in\` and \`not in\` for sequences, and \`is\` / \`is not\` for memory reference comparison.`;
        } else if (mod.title.includes('Strings')) {
          explanation = `*   **Strings**: Immutable sequences of characters defined with single, double, or triple quotes.
*   **Indexing & Slicing**: \`s[start:stop:step]\` format. Python supports negative indexing (\`s[-1]\` is the last character).
*   **Formatting**: Clean layouts using formatted literals: \`f"Hello {name}"\`.`;
        } else if (mod.title.includes('Collections')) {
          explanation = `*   **Lists**: Ordered, mutable, dynamic sequences: \`my_list = [1, 2, 3]\`.
*   **Tuples**: Ordered, immutable sequences: \`my_tuple = (1, 2)\`.
*   **Sets**: Unordered collection of unique items: \`my_set = {1, 2, 3}\`.
*   **Dictionaries**: Key-value pairs matching unique hashing keys to values: \`my_dict = {"key": "val"}\`.`;
        } else if (mod.title.includes('Control Flow') || mod.title.includes('Loops')) {
          explanation = `*   **Conditionals**: Execute blocks dynamically using \`if\`, \`elif\`, \`else\`, or \`match-case\`.
*   **Loops**: Iterate over lists/sequences using \`for\`, or repeat steps while conditions hold using \`while\`.
*   **Keywords**: Use \`break\` to terminate loops early, \`continue\` to skip iterations, or \`pass\` as placeholders.`;
        } else if (mod.title.includes('Functions')) {
          explanation = `*   **Defining Functions**: Use \`def function_name(params):\` and return values using \`return\`.
*   **Arguments**: Supports positional, keyword, default values, and variable-length arguments (\`*args\` and \`**kwargs\`).
*   **Scope**: Local vs. Global scopes governed by namespace rules.`;
        } else if (mod.title.includes('Exception')) {
          explanation = `*   **Error Handling**: Protect applications from crashes using \`try\`, \`except\`, \`else\`, and \`finally\` structures.
*   **Assertions & Raising**: Throw exceptions intentionally using \`raise Exception("details")\`.
*   **Custom Classes**: Subclass \`Exception\` to implement domain-specific checks.`;
        } else {
          explanation = `*   **Classes**: Blueprints to construct custom objects: \`class Dog:\`.
*   **Inheritance**: Subclass elements to reuse attributes: \`class GermanShepherd(Dog):\`.
*   **OOP Pillars**: Inheritance, Polymorphism (method override), Encapsulation (private variables \`__attr\`), and Abstraction.`;
        }

        await prisma.lessonStep.upsert({
          where: { id: textStepId },
          update: {},
          create: {
            id: textStepId,
            lessonId: les.id,
            stepType: LessonStepType.text,
            sortOrder: 1,
            title: `Step 1: Understanding ${les.title}`,
            textContent: `# Introduction to ${les.title}

In this lesson, we will focus on understanding **${les.title}** and how to use it inside Python projects.

### Key Concepts:
${explanation}

### Python Syntax Example:
\`\`\`python
# Practical example of ${les.title}
def demonstrate_concept():
    # Example logic demonstrating how this works in real projects
    print("Concept: ${les.title}")

demonstrate_concept()
\`\`\`

### Guidelines:
1. Practice writing this code structure in a local Python shell.
2. Be mindful of correct indentation rules (Python uses 4 spaces by default).
3. Resolve syntax errors immediately to keep execution stable.`
          }
        });
        totalStepsSeeded++;
      }
    }
  }

  console.log(`\n🎉 Python Course Seeding Completed!`);
  console.log(`Seeded ${totalStepsSeeded} new Lesson Steps.`);
  console.log(`Seeded ${totalAssignmentsSeeded} new Assignments.`);
}

main()
  .catch((e) => {
    console.error('Error seeding Python course:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
