from langchain_experimental.agents import create_pandas_dataframe_agent
from langchain_community.chat_models import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
import os

def query_agent(df, question):
    llm = ChatOpenAI(
        temperature=0,
        model_name="gpt-4",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    agent = create_pandas_dataframe_agent(
        llm,
        df,
        verbose=True,
        agent_type="openai-tools",
        allow_dangerous_code=True
    )
    return agent.run(question)
