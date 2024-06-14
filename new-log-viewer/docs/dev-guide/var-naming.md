# Variable naming

To differentiate variables that use different starting indexes (0 vs. 1), we use the following
naming convention:

* 1-based indexing variable names end with the suffix `Num`
* 0-based indexing variable names end with the suffix `Idx`

Variables that are a total also use the suffix `Num`. 
 
For example, when referencing log events through a URL, we use 1-based indexing, so the related
variable names end with `Num`.
