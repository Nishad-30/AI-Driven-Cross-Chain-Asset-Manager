import streamlit as st
import requests
import time

# Backend URL
BACKEND_URL = "http://localhost:5000/command"

st.title("AI-Driven Cross-Chain Asset Manager 💠")

if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("Enter your command..."):
    # Save user input
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Call your Node.js backend
    try:
        response = requests.post(
            BACKEND_URL,
            json={
                "command": prompt,
                "wallet": "0x6a39E71e6958C1598553721E883da2085645b2E7"  # test wallet
            },
            timeout=20
        )

        # ⚠️ Use .text() since backend is plaintext
        assistant_response = response.text.strip()

    except Exception as e:
        assistant_response = f"❌ Backend not reachable: {str(e)}"

    # Display assistant response with animation
    with st.chat_message("assistant"):
        message_placeholder = st.empty()
        full_response = ""
        for chunk in assistant_response.split():
            full_response += chunk + " "
            time.sleep(0.05)
            message_placeholder.markdown(full_response + "▌")
        message_placeholder.markdown(full_response)

    st.session_state.messages.append({"role": "assistant", "content": full_response})
