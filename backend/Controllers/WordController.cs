using System.IO;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class DailyWordController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<DailyWordController> _logger;
 
    public DailyWordController(DataContext context, ILogger<DailyWordController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet()]
    public IActionResult Get()
    {
        var dailyWord = _context.DailyWord.SingleOrDefault(dw => dw.Date == GetNowEasternStandardTime().Date);

        if (dailyWord == null)
        {
            dailyWord = new DailyWord
            {
                Date = GetNowEasternStandardTime().Date,
                Word = GetNewRandomWord()
            };
            _context.DailyWord.Add(dailyWord);
            _context.SaveChanges();
        }

        return Ok(dailyWord.Word);
    }

    [HttpGet("{dateString}")]
    public IActionResult GetByDate([FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest();
        }

        var dailyWord = _context.DailyWord.SingleOrDefault(dw => dw.Date == date.Date);
        return Ok(dailyWord?.Word ?? string.Empty);
    }

    [HttpGet("{dateString}/new-word")]
    public IActionResult NewWord([FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest();
        }

        var dailyWord = _context.DailyWord.SingleOrDefault(dw => dw.Date == date.Date);

        // if a word does not exist for the specified day, create a new one
        if (dailyWord == null)
        {
            dailyWord = new DailyWord
            {
                Date = date.Date,
                Word = GetNewRandomWord()
            };
            _context.DailyWord.Add(dailyWord);
        }
        else
        {
            // otherwise, generate a new word for that day
            dailyWord.Word = GetNewRandomWord();
        }

        _context.SaveChanges();

        return Ok(dailyWord.Word);
    }

    private DateTime GetNowEasternStandardTime()
    {
        return TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time"));
    }

    private string GetNewRandomWord()
    {
        if (!System.IO.File.Exists(".\\Resources\\allowed.txt"))
        {
            throw new Exception("DICTIONARY NOT FOUND");
        }

        var words = System.IO.File.ReadAllText(".\\Resources\\allowed.txt")
            .Split('\n');

        var randomIndex = new Random().Next(0, words.Length);

        return words[randomIndex].ToUpper();
    }
}
