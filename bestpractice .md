精度を劇的に向上させるベストプラクティス
誰でも今日から実践できる、Claude の精度を上げるためのTipsを紹介します。

CLAUDE.mdでコンテキストを永続化する
Claude のセッションはステートレスです。つまり、一度セッションを終了すると、そこでの会話内容はメモリから消えてしまいます。当然、セッションごとにプロジェクトのコードやディレクトリ構成、技術スタックなどの情報もリセットされます。

そこで、常に参照させたい、またはセッションを跨いで記憶させておきたい情報は、/init コマンドで作成した CLAUDE.md に記載しましょう。CLAUDE.md は、新しいセッションが開始されるたびに自動的に読み込まれるため、Claude は常に最新のプロジェクトコンテキストを把握できます。

しかし、コンテキストをゼロから記述するのは大変なので、公式のサンプルプロンプトを活用し効率的に CLAUDE.md を充実させましょう。以下は、日本語で出力するように少しチューニングを加えたプロンプト例です。

> what does this project do?, and write it in Japanse in CLAUDE.md
> give me an overview of this codebase, and write it in Japanse in CLAUDE.md
> what technologies does this project use?, and write it in Japanse in CLAUDE.md
> explain the main architecture patterns used here, and write it in Japanse in CLAUDE.md
> where is the main entry point?, and write it in Japanse in CLAUDE.md
> explain the folder structure, and write it in Japanse in CLAUDE.md
> analyze the database schema, and write it in Japanse in CLAUDE.md
> what are the key data models?, and write it in Japanse in CLAUDE.md
> how does error handling work in this app?, and write it in Japanse in CLAUDE.md
> how is authentication handled?, and write it in Japanse in CLAUDE.md

参照：

Ask your first question - Anthropic Docs
Understand new codebases - Anthropic Docs
プロンプトに大量のテキストを入力しない
どうやら、プロンプトに大量のテキストを直接入力すると、Claude は処理に苦戦するようです。
これはLLMの特性によるものです。
なので、大量の指示や設定をしたい場合は、ファイルに記述し読み込ませましょう。効率的に処理し、より良い回答を生成できます。

参照：Handling large inputs - Anthropic Docs

ultrathink
Claude には、その思考の深さを制御する概念が存在します。特定の単語を使用することで、消費トークンは増えますが、より深く思考し、回答の精度を高めることができます。
Maxプランならどれだけトークンを消費しても値段は変わらないので常に ultrathink がおすすめです。

think (上限4,000トークン)
think hard (上限10,000トークン)
think harder (上限31,999トークン)
ultrathink (上限31,999トークン)
上記のように、思考深度は ultrathink が最も深く、複雑な問題に対してより質の高い回答を得たい場合に有効です。

※補足
ちなみに、これは公式ドキュメントには記載されていません。@anthropic-ai/claude-code の cli.js に直接記述されています。
確認手順は以下です。

Claude Codeのインストールパスに移動
自分は bun を使っていますが、npm, anyenvなどを使っている場合は、which claude でインストールパスをご確認ください。
cd ~/.bun/install/global/node_modules/@anthropic-ai/claude-code

minifyを元に戻す
当前ですが、パッケージとして配布されてるのでそのままだと minify されていて見にくいです。
prettier でフォーマットしましょう。
bunx prettier --write cli.js

お好みのエディタで開いて検索
自分は Cursor 使ってるので以下コマンドでファイルを開いています。
お好みのエディタで開いていただいて、あとは cmd + F で ultrathink で検索してご確認いただけます。
cursor cli.js （ここからは cmd + F で ultrathink と検索をかけてください。）

念の為、バージョン 1.0.29（2025-06-20日時点） でのコードのスクショを置いておきます。



参照：https://simonwillison.net/2025/Apr/19/claude-code-best-practices/

Explore, Plan, Code, Commit
Claude は特定の Workflow に依存することなく柔軟に指示ができる反面、フワッとした指示だと変に行間を読んで明後日の方向に進んでしまいます。
より良い精度と確実なアウトプットを得るには、いきなりタスク実装を投げるのではなく、コード理解、設計、実装、コミットの順番で命令を実行することがベストプラクティスとされています。

Explore
まずはコードベースや関連ファイルなどを理解させるフェーズ。
> find the files that handle user authentication

Plan
実装の計画や設計について深く考えさせるフェーズ。
ここで ultrathink を使うと効果的です。
> ultrathink how to implement Role Based User Authentication

Code
計画に基づき、具体的なコード実装を依頼するフェーズ。
> implement its solution

Commit
実装された変更内容をコミットさせるフェーズ。
> commit this

このように、段階を踏みながら命令をすることで、精度が劇的に向上します。

参照：Explore, Plan, Code, Commit - Anthropic Engineering

TDD（テスト駆動開発）
TDDの説明は省きます。
TDD WorkflowはAnthropicお墨付きのワークフローです。

テストの実装を命令
まずは、実装したい機能のテストコードを Claude に実装させ、それをコミットします。
このテストは、最初は失敗するように（機能が未実装なので）なります。
テストをパスする実装を命令
次に、テストコードを修正せずに、そのテストがパスするように実装コードを書くよう Claude に命令します。
こうすることで、アウトプットのブレが格段に少なくなります。
!
出来上がった実装がテストデータに過剰適合することがあるらしいので、Claude が生成したコードは、必ず人間の目でレビューし、必要に応じてテストケースや実装を調整しましょう。

良さげのプロンプトがあったので貼っておきます。



/clear
セッション内での会話が長くなると、Claude がこれまでの会話の流れに引き摺られ、文脈を誤解したり、変な回答をすることがあります。
そう感じた際は、プロンプトで /clear コマンドを実行することでこれまでの会話をリセットできます。

claude --resume
一度閉じたけどやっぱりこのセッションを再開したい・・・ってことありませんか？
例えば、割り込みタスクのために起動中のセッションを閉じて、別ブランチに切り替えて新しくセッションを立ち上げ、割り込みタスクが終われば元のブランチに戻って・・・などなど。

その際に便利なオプションが--resume, -rです。
このオプションを実行すると、過去のセッション（公式ドキュメントでは conversation と表現されています）の一覧が表示されます。戻りたいセッションを選ぶことでセッションを再開できます。

claude --resume

過去のセッションが何日前まで保存されるかについては、分かりませんでした。。。

参照：Resume previous conversations - Anthropic Docs