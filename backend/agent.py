import os
import io
import base64
import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from dotenv import load_dotenv
from openai import OpenAI

from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain_experimental.tools import PythonREPLTool
from langchain.tools import Tool

matplotlib.use('Agg')
load_dotenv()

agent_cache = {}
memory_cache = {}
openai_client = OpenAI()

def refine_answer(raw_answer: str, model="gpt-4"):
    print("✅ Refine Answer...")
    system_prompt = """
    You are a senior enterprise revenue analyst.

    Rewrite the following analysis in a clear and concise format suitable for a CRO.

    Guidelines:
    - Use bullet points for key insights
    - Keep the language professional and business-focused
    - Highlight trends, comparisons, and outliers
    - If appropriate, end with a recommendation
    - Do not include any code or technical implementation details
    """
    try:
        response = openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": raw_answer}
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("[Refine error]", str(e))
        return raw_answer

def create_custom_agent(df_or_dfs, file_id):
    llm = ChatOpenAI(model_name="gpt-4", temperature=0)

    def pandas_tool_func(query):
        try:
            local_vars = {}

            if isinstance(df_or_dfs, list):
                for i, df in enumerate(df_or_dfs):
                    local_vars[f"df{i}"] = df
                local_vars["df"] = df_or_dfs[0]
                local_vars["dfs"] = df_or_dfs
            else:
                local_vars["df"] = df_or_dfs
                local_vars["dfs"] = [df_or_dfs]
                local_vars["df0"] = df_or_dfs

            exec(f"result = {query}", {}, local_vars)
            return str(local_vars["result"])
        except Exception as e:
            return f"Error: {str(e)}"

    pandas_tool = Tool(
        name="pandas_tool",
        func=pandas_tool_func,
        description="Use this tool to analyze the DataFrame. Use `df0`, `df1`, ... for each uploaded file. `df` is the first file by default. `dfs` is the full list."
    )

    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

    agent = initialize_agent(
        tools=[pandas_tool, PythonREPLTool()],
        llm=llm,
        memory=memory,
        agent=AgentType.OPENAI_FUNCTIONS,
        verbose=True,
    )

    agent_cache[file_id] = agent
    memory_cache[file_id] = memory
    return agent

def query_agent(df_or_dfs, question, file_id=None):
    if file_id in agent_cache:
        agent = agent_cache[file_id]
    else:
        agent = create_custom_agent(df_or_dfs, file_id)

    memory = memory_cache[file_id]
    print(f"\n🧠 Chat History for {file_id}:\n{memory.load_memory_variables({})['chat_history']}\n")

    result = agent.invoke({"input": question})
    answer = result["output"] if isinstance(result, dict) else result

    buf = io.BytesIO()
    try:
        fig = plt.gcf()
        if any(ax.has_data() for ax in fig.get_axes()):
            plt.savefig(buf, format='png')
            buf.seek(0)
            image_base64 = base64.b64encode(buf.read()).decode("utf-8")
            chart_data_url = f"data:image/png;base64,{image_base64}"
            print("[Chart] ✅ Valid chart captured")
        else:
            chart_data_url = None
            print("[Chart] ⚠️ No meaningful chart generated")
    except Exception as e:
        print("[Chart ERROR]", str(e))
        chart_data_url = None
    finally:
        plt.close()

    refined = refine_answer(answer)
    return {"answer": refined, "chart": chart_data_url}
