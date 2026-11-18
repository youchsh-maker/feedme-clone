# 클립보드 쓰기 실패 처리

- 증상: 클립보드 권한이 거부되면 copy()/openIn()의 writeText가 reject되어 피드백 토스트가 뜨지 않는다.
- 근거: code-review low 지적, 스펙 범위 밖 엣지케이스.
- 다음 단계: try/catch로 실패 안내 토스트를 보여 준다.
