export const Field = ({ children, className }: any) => (
    <div className={`space-y-1 ${className ?? ""}`}>{children}</div>
)

export const FieldLabel = ({ children, ...props }: any) => (
    <label className="text-sm font-medium" {...props}>
        {children}
    </label>
)
