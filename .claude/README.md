https://www.notion.so/epicmoble/cursor-vscode-claude-ide-_ai-Tool-208228ab36a08089b2c7e8036cca3e52?v=63484b3e771b4266af394cadb6921b60&source=copy_link#220228ab36a08021a2c4c4e55f2b41aa

https://docs.anthropic.com/en/docs/claude-code/overview#project-configuration
https://docs.anthropic.com/en/docs/claude-code/settings
https://docs.anthropic.com/en/docs/claude-code/iam#configuring-permissions

https://docs.anthropic.com/en/docs/claude-code/sub-agents
https://www.aitmpl.com/
https://www.bing.com/search?q=claude%20code%20subagent%20template

https://docs.anthropic.com/ko/docs/claude-code/mcp
https://www.google.com/search?q=claude+code+mcp
https://github.com/zebbern/claude-code-mcp

https://github.com/upstash/context7

`npx playwright install` 실행이 굉장히 오래 걸려서, claude code의 cli 화면이 10분동안 정지된 것 처럼 보임; -> claude code가 실행하게 하지 말고, bash에서 미리 실행-설치완료 해놓자. 




## FAQ

### Q: settings.json에 deny 정책을 설정 해놨어도, 강제로 @ 파일지정을 해서, prompt에 dir 파일 참고 값을 claude에 입력할 수 있나?

A: 네, 가능합니다. settings.json의 deny 정책은 Claude가 자동으로 파일을 탐색하거나 접근하는 것을 제한하지만, 
사용자가 @ 기호로 명시적으로 파일을 지정하면 해당 파일의 내용이 프롬프트에 포함됩니다.

예를 들어:
```json
"fileGlobs": {
  "deny": ["**/*.env", "secret/**"]
}
```
로 설정해도, 사용자가 @.env 또는 @secret/config.js로 직접 참조하면 Claude가 해당 파일 내용을 볼 수 있습니다.
이는 사용자의 명시적인 의도를 우선시하는 설계입니다.


### Q: .gitignore 에서는 특정 dir 전체를 ignore에 추가 했어도, !/dir/filename 입력으로 ignore 지정된 특정 [file, dir]은 ignore 되지 않게 처리할 수 있는데, claude code 에서는 가능한가? 어떻게?

A: 네, 맞습니다. .gitignore처럼 Claude의 settings.json에서도 비슷한 방식으로 예외 처리가 가능합니다.
Claude의 settings.json에서도 .gitignore와 유사하게 예외 처리가 가능합니다:
```json
{
  "permissions": {
    "deny": [
      "Read(references_deprecated/**)"
    ],
    "allow": [
      "Read(references_deprecated/제품서비스매뉴얼
_from-notion-export_20250714/**)"
    ]
  }
}
```
현재 설정에서는 주석 처리되어 있지만, allow 배열에 특정 경로를 추가하면 deny로 막힌 디렉토리 내의 특정 파일/폴더에 접근할 수 있습니다.

작동 원리:
  - deny가 먼저 적용되고, 그 다음 allow가 적용됩니다
  - 더 구체적인 경로가 우선순위를 가집니다
  - .gitignore의 ! 패턴과 같은 역할을 합니다