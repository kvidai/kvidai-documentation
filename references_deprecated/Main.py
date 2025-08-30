"""
AI 이미지 및 영상 생성 플랫폼 - 메인페이지
"""

import streamlit as st
import os

# Get API_KEY from environment
# console_api_key = os.getenv("CONSOLE_API_KEY", "")

# Get FAL_API_KEY from environment or secrets
# fal_api_key = os.getenv("FAL_API_KEY", "")

## https://docs.streamlit.io/library/api-reference/utilities/st.set_page_config
## This must be the first Streamlit command used on an app page, and must only be set once per page.
st.set_page_config(
    page_title="Main",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 커스텀 CSS 스타일링
st.markdown(
    """
<style>
    .header-nav {
        background: #2c3e50;
        padding: 1rem 0;
        margin-bottom: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .nav-container {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
        flex-wrap: wrap;
        padding: 0 1rem;
    }

    .nav-button {
        background: #ffffff;
        color: #2c3e50;
        padding: 0.7rem 1.5rem;
        border: none;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .nav-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        background: #f8f9fa;
        text-decoration: none;
        color: #2c3e50;
    }

    .nav-button:active {
        transform: translateY(0);
    }

    .nav-icon {
        font-size: 1.1rem;
    }

    @media (max-width: 768px) {
        .nav-container {
            gap: 1rem;
            justify-content: center;
        }

        .nav-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
        }
    }

    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: #667eea;
        color: white;
        border-radius: 15px;
        margin-bottom: 2rem;
    }

    .feature-card {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #e1e5e9;
        margin: 1rem 0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        color: #2c3e50;
    }

    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .feature-card h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
    }

    .feature-card p {
        color: #495057;
        line-height: 1.6;
    }

    .feature-card ul {
        color: #495057;
    }

    .feature-card li {
        margin: 0.5rem 0;
        color: #495057;
    }

    .feature-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .cta-section {
        text-align: center;
        margin: 3rem 0;
        padding: 2rem;
        background: #4f46e5;
        border-radius: 15px;
        color: white;
    }

    .cta-section h3 {
        color: white;
        margin-bottom: 1rem;
    }

    .cta-section p {
        color: white;
        opacity: 0.9;
    }
</style>
""",
    unsafe_allow_html=True,
)

# 헤더 네비게이션
st.markdown(
    """
<div class="header-nav">
    <div class="nav-container">
        <a href="https://developers.kvid.ai" target="_blank" class="nav-button">
            <span class="nav-icon">🚀</span>
            개발자 포털
        </a>
        <a href="https://kvid.ai.kr" target="_blank" class="nav-button">
            <span class="nav-icon">🛍️</span>
            KVID 마켓
        </a>
        <a href="https://console.kvid.ai" target="_blank" class="nav-button">
            <span class="nav-icon">⚙️</span>
            콘솔
        </a>
        <a href="https://docs.kvid.ai" target="_blank" class="nav-button">
            <span class="nav-icon">📚</span>
            메뉴얼
        </a>
        <a href="https://discord.gg/7dsSsUhEzt" target="_blank" class="nav-button">
            <span class="nav-icon">💬</span>
            디스코드
        </a>
    </div>
</div>
""",
    unsafe_allow_html=True,
)

# 메인 헤더
st.markdown(
    """
<div class="main-header">
    <h1>🎨 AI 창작 스튜디오</h1>
    <h3>상상을 현실로 만드는 AI 이미지 & 영상 생성 플랫폼</h3>
    <p>텍스트 프롬프트만으로 놀라운 이미지와 영상을 생성하세요</p>
</div>
""",
    unsafe_allow_html=True,
)

# 주요 기능 소개
st.markdown("## ✨ 주요 기능")

col1, col2 = st.columns(2)

with col1:
    st.markdown(
        """
    <div class="feature-card">
        <div class="feature-icon">🎨</div>
        <h3>AI 이미지 생성</h3>
        <p>텍스트 설명만으로 고품질의 아름다운 이미지를 생성합니다. 다양한 스타일과 해상도를 지원하며, 창의적인 아이디어를 즉시 시각화할 수 있습니다.</p>
        <ul>
            <li>🎯 정확한 프롬프트 해석</li>
            <li>🔧 다양한 스타일 옵션</li>
            <li>📐 커스텀 해상도 지원</li>
            <li>⚡ 빠른 생성 속도</li>
        </ul>
    </div>
    """,
        unsafe_allow_html=True,
    )

with col2:
    st.markdown(
        """
    <div class="feature-card">
        <div class="feature-icon">🎬</div>
        <h3>AI 영상 생성</h3>
        <p>이미지나 텍스트로부터 동적인 영상을 생성합니다. 정적인 이미지에 생명을 불어넣고, 스토리텔링을 위한 영상 콘텐츠를 쉽게 제작하세요.</p>
        <ul>
            <li>🖼️ 이미지를 영상으로 변환</li>
            <li>📝 텍스트에서 영상 생성</li>
            <li>🎛️ 프레임 수 조절</li>
            <li>🔍 고화질 출력</li>
        </ul>
    </div>
    """,
        unsafe_allow_html=True,
    )

# CTA 버튼
st.markdown("## 🚀 지금 시작하기")

st.markdown(
    """
<div class="cta-section">
    <h3>AI 창작의 세계로 떠나보세요!</h3>
    <p>몇 분 안에 놀라운 작품을 만들 수 있습니다</p>
</div>
""",
    unsafe_allow_html=True,
)

col1, col2, col3 = st.columns([1, 1, 1])

with col1:
    if st.button("🎨 이미지 생성하기", type="primary", use_container_width=True):
        st.switch_page("pages/2_Image_Generator.py")

with col2:
    st.markdown(
        "<div style='text-align: center; padding: 1rem;'><strong>또는</strong></div>",
        unsafe_allow_html=True,
    )

with col3:
    if st.button("🎬 영상 생성하기", type="primary", use_container_width=True):
        st.switch_page("pages/3_Video_Generator.py")
