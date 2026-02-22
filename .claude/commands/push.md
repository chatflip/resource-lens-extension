# Push

変更されているファイルを確認し、品質チェックを通してからブランチ作成・コミット・プッシュ・PR作成までを行ってください。

手順:

1. `git status` と `git diff` で変更内容を把握する
2. 変更内容から適切なブランチ名を決め、`git checkout -b <branch-name>` でブランチを作成する
   - ブランチ名の形式: `<type>/<short-description>`（例: `fix/cpu-tooltip`, `feat/gpu-support`）
   - すでに main 以外のブランチにいる場合はそのまま使う
3. `make format` で整形する
4. `make lint` で静的解析を通す
5. `make test` でテストを通す
6. 関連するファイルをグループ化し、1グループ＝1コミットとする
7. 各グループを `git add <files>` → `git commit` で順番にコミットする
8. すべてのコミットが終わったら `git push -u origin <branch-name>` する
9. `gh pr create` で PR を作成する

コミットメッセージ・PR タイトル・PR 本文は各変更の内容から適切に生成してください。
