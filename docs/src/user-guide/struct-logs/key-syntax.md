* Nested keys can be specified using periods (`.`) to denote hierarchy.
  * E.g., the field `{"a:" {"b": 0}}` may be denoted by `a.b`.
* Auto-generated keys in a [Key-Value Pair IR Stream][kv-pair-ir] can be specified by using `@` as
  a prefix.
  * E.g., the auto-generated key `ts` would be specified as `@ts`.
* Keys can contain any character, except the following characters must be escaped with a backslash:
  * `.`
  * `@`
  * `{`
  * `}`
  * `:`
  * `\`

[kv-pair-ir]: https://docs.yscope.com/clp/main/dev-docs/design-kv-ir-streams/auto-gen-kv-pairs.html
