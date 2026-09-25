namespace DetailingStore.Api.Exceptions;

/// <summary>
/// Exception thrown when an external service call fails
/// </summary>
public class ExternalServiceException : Exception
{
    public ExternalServiceException(string message) : base(message)
    {
    }

    public ExternalServiceException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
