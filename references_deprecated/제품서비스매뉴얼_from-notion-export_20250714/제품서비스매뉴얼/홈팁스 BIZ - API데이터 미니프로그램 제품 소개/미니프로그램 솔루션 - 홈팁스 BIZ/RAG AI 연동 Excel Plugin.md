# RAG AI 연동 Excel Plugin

By installing and using it within MS Office Excel, 
you can build various [work automation, content creation automation] workflows within Excel files, utilizing external APIs including AI APIs.

![image.png](RAG%20AI%20%E1%84%8B%E1%85%A7%E1%86%AB%E1%84%83%E1%85%A9%E1%86%BC%20Excel%20Plugin/0dd63cdf-4013-4c02-ab13-455731a6be18.png)

# — pricing

“**unit price * 사용량**” 만큼 보유 credit이 차감 됩니다 

- function call unit price: 1 function기능 실행당 기능별 [0.01, 0.02, 0.05, 0.1, custom]달러 에 해당하는 credit 차감
- function call별 사용가격 차이 이유: cloud function 내 코드 실행시간, 개발구현-유지보수 난이도, 외부 리소스 사용금액 반영 등

**— pricing example**

- $10 결제시, 1실행당 $0.01 function 1000번(10열 * 100행) 실행 가능
- `=RUN_GPT(PARSE_JSON(B1))` → 1실행 당 $0.01 + $0.05 = $0.06

# — 전체 기능

### **Custom 기능**

- 동영상 생성
- 콘텐츠 생성
- Custom AI GPT 실행
- 엑셀형 데이터-수식 이용 외부 API 연동가능 : RAG Image Video API 이용 대량생성 시나리오 활용 등
- excel내용 콘솔로 보내기:
    - 20250509 Features currently **available:** 네이버 카페 예약글 작성
    - Features currently unavailable: [네이버 톡톡 AI챗봇, AI Model fine-tuning 하기] 등

### **Custom Function: 엑셀 `=F(x)`수식 형태 사용 가능**

- 각종 (JSON)형태의 데이터 가공 파싱 기능 등, Helper Function
- GPT형 기능 수식
    - RUNGPT_TEXT(Text)
    - RUNGPT_IMAGE_TO_TEXT(ImageURL)
    - RUNGPT_ASYNC_RESULT(TaskID) 등

### 동영상 생성

엑셀에서 **Prompt**와 **Image**를 입력하면 AI가 이를 기반으로 영상을 자동으로 생성하는 기능입니다. 사용자는 텍스트로 원하는 장면을 설명하고, 참고 이미지를 추가하면 AI가 이를 분석하여 자연스러운 영상 콘텐츠를 제작합니다. 이 기능을 통해 빠르고 효율적으로 고품질의 AI 영상을 생성할 수 있습니다.

동영상 생성은 프롬프트에 따라 1~4분 가량 소요되며, 생성된 동영상은 콘솔 사이트(https://console.hometip.net)의 미디어 라이브러리에 저장 됩니다.

- prompt 열 : 생성할 동영상에 적용 될 prompt가 입력 된 열, 전체 열을 입력 하거나(A,B 등) 특정 범위의 열을 입력(A2:A4)
- image_prompt 열 : 동영상을 생성 할 때 첫 프레임으로 사용되거나 참고할 만한 이미지가 있는 경로나 주소가 입력 된 열, 전체 열이나 일정 범위로 입력 가능
- output file 열 : 생성된 동영상이 저장 될 동영상 이름이 입력 된 열.

### 컨텐츠 생성

엑셀에 **컨텐츠 작성을 위한 Prompt**를 입력하면, 각 열에 맞춰 다양한 마케팅 글을 자동으로 생성하는 기능입니다. 사용자가 원하는 주제나 키워드를 입력하면 AI가 이를 분석하여 SNS 게시물, 광고 카피, 제품 설명 등 다양한 형태의 마케팅 콘텐츠를 효율적으로 작성해 줍니다. 이를 통해 반복적인 작업을 줄이고, 창의적인 마케팅 메시지를 빠르게 제작할 수 있습니다.

- 입력 열 : 컨텐츠를 잘성할 때 사용 될 prompt가 입력되어 있는 열입니다. 주제, 제목, 태그 등 다양한 정보들을 자유롭게 입력 할 수 있습니다.
- 출력 열 : AI를 통해 입력 받은 prompt를 통해 생성된 컨텐츠 text를 저장 시킬 excel 열을 입력

### 커스텀 AI 실행

엑셀에서 **프롬프트, GPT 설정** 등을 입력하면, 사용자가 원하는 맞춤형 AI 기능을 자유롭게 활용할 수 있는 기능입니다. 각 셀에 입력된 프롬프트와 설정값을 기반으로 AI가 다양한 작업을 수행하며, 텍스트 생성, 데이터 분석, 코드 작성 등 원하는 형태로 커스터마이징된 결과를 제공합니다. 이를 통해 복잡한 AI 활용도 간편하게 자동화할 수 있으며, 업무 효율성을 극대화할 수 있습니다.

- 옵션 설정 : 사용하고자 하는 AI 모델, 서비스 key등 이 입력되어있는 옵션 선택
- 입력 열 : api 프롬프트를 적용시킬 내용이 들어있는 열이나 범위를 입력, 원문 text 뿐만 아니라 image, video등 입력 가능
- 프롬프트 열 : 입력 열에 입력한 원문 콘텐츠에 적용시킬 AI prompt가 입력되어 있는 열 입력
- 출력 열 : 최종적으로 생성된 AI 결과물을 기록 할 엑셀 열 입력