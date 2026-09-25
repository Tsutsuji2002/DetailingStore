namespace DetailingStore.Api.Exceptions;

/// <summary>
/// Exception thrown when security validation fails (e.g., signature validation)
/// </summary>
public class SecurityException : Exception
{
    public SecurityException(string message) : base(message)
    {
    }

    public SecurityException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
