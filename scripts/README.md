
## notion_export_hash_removal_scripts
```
try refactor filename in  "references_deprecated/제품서비스매뉴얼_20250714" -> delete like  "제품서비스 매뉴얼 223228ab36a080e7a125cb37d6573e10" to "제품서비스 매뉴얼". + md파일 내부에 링크url까지 수정
```
```
claude code 너가 힘들게 만들어서 사용했던 script들 전부 ./scripts에 저장해, 나중에 또 빨리 사용할 수 있게.

script 파일 실행중 생성되는 log파일들은 ./scripts 에 저장하지 말고, .gitignore에 ignore 추가해.


기존 notion에 작성했던 docs 내용을, md파일 등 text 파일에 저장하는 것이 AI LLM Gen 기능 이용에 효율적이라, 향후에도 script들을 이용 할 경우가 종종 있을 것 같다.

notion page export시, "홈팁스 콘솔 - 카페 글쓰기 예약 3df28ca81aa24200bb703731fd80d1b4" 같이, 파일이름 뒷쪽에 이상한 hash 값이 붙어서 export저장됨.
=> OS 파일길이 제한 문제를 해결하기 위해서 + 호스팅 url에 hash string이 표시될 수있어서, 파일 이름에 포함된 hash값을 삭제해야 됨.
```