import { newModel, StringAdapter } from "casbin";

// TODO: move to config and load from there
export const model = newModel(`
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)
`);

// TODO: move to config and load from there
export const adapter = new StringAdapter(`
p, admin, blog_posts, (list)|(create)
p, admin, blog_posts/*, (edit)|(show)|(delete)
p, admin, blog_posts/*, field

p, admin, categories, (list)|(create)
p, admin, categories/*, (edit)|(show)|(delete)

p, editor, categories, list
p, editor, categories/*, show

`);
