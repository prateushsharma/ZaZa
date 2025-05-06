import json
from groq import Groq
from pydantic import BaseModel
from typing import List, Dict, Any


class ResponseFormat(BaseModel):
    requirements: List[str]
    imports: List[str]
    code: str


prompt = """
    You are an intelligent code assistant. Your job is to generate Python code and provide it in a structured JSON format.

    The JSON format must be:

    {
        "requirements": list of libraries that must be installed using pip (e.g., ["openai", "requests"]),
        "imports": list of all import statements used in the code (e.g., ["import requests"]),
        "code": complete code as a string, including imports
    }

    ---

    Example 1:

    User Query:
    Write a code that prints 'Hello, World!' in Python in an infinite loop after every 5 seconds. But it also imports openai and requests libraries which is only for testing.

    Expected JSON Output:
    {
        "requirements": ["openai", "requests"],
        "imports": ["import time", "import openai", "import requests"],
        "code": "import time\\nimport openai\\nimport requests\\n\\nwhile True:\\n    print('Hello, World!')\\n    time.sleep(5)"
    }

    ---

    Now answer the following query in the same JSON format:

    User Query:
    Write a Python program that:
    - simply prints 'Hello, World!' infinitely every 1 second.
"""


def generate_code_response(prompt: str) -> Dict[str, Any]:
    client = Groq()

    chat_completion = client.chat.completions.create(
        model="deepseek-r1-distill-llama-70b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.6,
        max_completion_tokens=1024,
        top_p=0.95,
        stream=False,
        reasoning_format="parsed",
        response_format={"type": "json_object"}
    )

    response_content = chat_completion.choices[0].message.content
    parsed_response = json.loads(response_content)

    # Optional: Validate the structure using the Pydantic model
    validated_response = ResponseFormat(**parsed_response)

    # Return as dict
    return validated_response


# Example of how to use this function:
def gen_code(prompt=prompt) -> tuple[list[str], list[str], str]:
    result = generate_code_response(prompt)
    
    # Extract the values from the ResponseFormat model
    requirements = result.requirements
    imports = result.imports
    code = result.code

    # Pretty-print the entire structure if needed
    print(json.dumps(result.dict(), indent=4))
    
    # Return the tuple
    return requirements, imports, code