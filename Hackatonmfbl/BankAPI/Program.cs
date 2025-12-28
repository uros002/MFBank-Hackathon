using BankAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register FAQMatcher as Singleton
builder.Services.AddSingleton<FAQMatcher>(sp =>
{
    var matcher = new FAQMatcher();
    var dataPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "faq_export.json");
    matcher.LoadData(dataPath);
    return matcher;
});

builder.Services.AddSingleton<PythonFAQService>();
// Register EmailService as Singleton
builder.Services.AddSingleton<EmailService>();

// Register QuestionQueueService as Singleton and Hosted Service
builder.Services.AddSingleton<QuestionQueueService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<QuestionQueueService>());

var app = builder.Build();

// Use CORS - MUST be FIRST
app.UseCors("AllowAll");

// Remove this line - it causes CORS issues
// app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();