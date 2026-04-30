---
title: 카페 글쓰기 예약 기능
description: 카페 글쓰기 자동화 및 스케줄링 서비스 사용법
slug: content-scheduling
tags: [카페글쓰기, 예약, 자동화, 스케줄링]
sidebar_position: 2
---

# 카페 글쓰기 예약 기능

카페 글쓰기 예약 기능은 운영하기 위해 일정 주기 및 매일 들어가서 글을 작성해야 하는 불편함을 해결하고자 컨텐츠를 작성하고 날짜를 설정해 놓으면 해당 날짜에 글을 카페에 자동으로 업로드해 주는 스케줄링 서비스입니다.

## 📝 Content Manager - 자동 글쓰기 목록

![자동 글쓰기 목록](/img/console-guide/image.png)

해당 collection에 있는 목록들을 정해놓은 schedule 날짜에 지정한 카페 게시판에 글쓰기를 진행합니다.

### 필수 입력 항목 (*)

| 항목 | 설명 |
|------|------|
| **activate*** | 임시저장인지 실제로 배포할 내용인지 표시 |
| **title*** | 글 제목 |
| **content1~10*** | 발행할 글 내용, text를 넣을 수도 있고 image url을 넣을 수도 있음. option에 텍스트인지 image인지 표시해서 처리함, 10개 중 원하는 만큼만 입력하면 됨 |
| **sheet*** | 아래에서 설명하는 "시트 배포 정보" collection에서 등록한 sheet 이름 |

### 선택 입력 항목

| 항목 | 설명 |
|------|------|
| **directory** | 글 분류, 사용자 임의 지정 |
| **platform** | 글을 발행할 플랫폼, 네이버 카페뿐만 아니라 워드프레스 같은 api로 글 발행할 수 있는 다른 곳에도 기능 적용할 예정 |
| **writing_location** | 글 발행할 위치, 사용자 임의 지정 |
| **table** | 카페 글쓰기 할 게시판 고유 id - 실제 target은 "시트 배포 정보"설정값에 따름 - 편의상 제공 |
| **post_tag** | 글 태그 |
| **writing_target_url** | 글쓰기를 진행할 카페의 url - 실제 target은 "시트 배포 정보"설정값에 따름 - 편의상 제공 |
| **reference_url** | 글 쓸때 참고한 문서 url |
| **manager** | 글 작성 담당자 |
| **writer** | 글 작성자 |
| **memo** | 기타 메모 |
| **post_writing_schedule_date** | 글 발행할 날짜 미 입력할 경우 배포 실행 시 바로 작성 됨 |
| **user_prompt** | 기타 글 쓰기 처리할 때 사용될 내용-css, 강조하고 싶은(bold 처리 등) 키워드 목록 등등 |

(*) 처리한 항목은 필수 입력 값임

## ⚙️ 시트 배포 정보

![시트 배포 정보](/img/console-guide/image-1.png)

- 시트 단위로 설정할 수 있음
- 예를 들어 글 목록에 sheet1로 해놓으면 target하는 카페와 게시판을 offset해 놓을 수 있도록 함

## 📤 카페 글 발행

![카페 글 발행](/img/console-guide/image-2.png)

- 스케줄링하지 않고 바로 글 작성할 때 사용됨
- "시트 배포 정보"에 등록된 sheet를 선택하고 글쓰기 진행
- 선택한 sheet가 적용된(입력된) "자동 글쓰기 목록"에 있는 글 목록들 중 날짜 입력하지 않은 글과 당일 날짜에 해당하는 글을 카페에 발행함

## 🎯 예상 사용 고객

정기적으로 글을 올려야하는 카페 운영자를 타겟으로 함:

- **학원 카페 등의 주간 강의 일정**
- **어린이집이나 식당에서 운영하는 카페의 주간, 일간 식단표**
- **좋은글 공유하는 카페등 (오늘의 명언 등)**
- **맘카페에서 오늘의 동네소식 등 정기적인 정보 공유 글 작성 등**

## 🛠️ 개발 및 테스트 정보

### 테스트 환경
- **개발 페이지**: [https://hometips-strapi-ts-staging1-juw3q2ixta-an.a.run.app/](https://hometips-strapi-ts-staging1-juw3q2ixta-an.a.run.app/)
- **현재 상태**: GCP staging 환경 URL (아직 도메인 등록 안됨)
- **향후 계획**: 인증 완료되는 대로 도메인 등록 예정

### 테스트 계정
- **ID**: tester1@epicmobile.kr
- **PW**: 11112222

:::info 참고사항
아직 도메인 등록은 안되어서 GCP staging 환경 URL입니다. 인증 완료되는 대로 도메인 등록할 예정입니다.
:::

## 📞 문의 및 지원

서비스 이용 중 문의사항이 있으시면:

- **디스코드**: [kvidAI 커뮤니티](https://discord.gg/wvsecByF)
- **이메일**: support@kvid.ai

---

**마지막 업데이트**: 2025년 7월 14일  
**작성자**: kvidAI 팀