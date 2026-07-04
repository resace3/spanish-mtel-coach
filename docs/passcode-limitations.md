# Passcode Limitations

The passcode gate is a casual access gate, not true authentication.

Static apps cannot keep client-side code hidden. The built JavaScript bundle must be sent to the browser. That bundle includes the public passcode hash and salt generated from the GitHub Actions secret.

A strong passphrase reduces casual guessing. It does not create server-grade security, because an attacker can inspect the static files and attempt offline guessing.

For truly private authentication, a backend or identity provider would be required. This project intentionally does not use one because all learner progress is designed to stay in the browser only.
