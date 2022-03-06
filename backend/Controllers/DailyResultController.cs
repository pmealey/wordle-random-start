using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class DailyResultController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<DailyWordController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;
 
    public DailyResultController(DataContext context, ILogger<DailyWordController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet("{id:int}")]
    public IActionResult Get([FromRoute] int id)
    {
        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.Id == id);

        if (dailyResult == null)
        {
            return NotFound();
        }

        return Ok(dailyResult);
    }

    [HttpGet("{user}/{dateString}")]
    public IActionResult GetDailySummary([FromRoute] string user, [FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResults = _context.DailyResult
            .Where(dr => dr.User == user && dr.Date == date.Date)
            .AsEnumerable()
            .Join(
                _resultParsers,
                (dr) => dr.Game,
                (rp) => rp.GameName,
                (dr, rp) => new {
                    DailyResult = dr,
                    Priority = rp.Priority
                })
            .OrderBy(o => o.Priority)
            .Select(o => o.DailyResult)
            .ToList();

        return Ok(dailyResults);
    }

    [HttpGet("{user}/{dateString}/{game}")]
    public IActionResult GetGameResult([FromRoute] string user, [FromRoute] string dateString, [FromRoute] string game)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.User == user && dr.Date == date.Date && dr.Game == game);

        if (dailyResult == null)
        {
            return NotFound();
        }

        return Ok(dailyResult);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete([FromRoute] int id)
    {
        var dailyResult = _context.DailyResult.SingleOrDefault(dr => dr.Id == id);

        if (dailyResult != null)
        {
            _context.DailyResult.Remove(dailyResult);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{user}")]
    public IActionResult Delete([FromRoute] string user)
    {
        var dailyResults = _context.DailyResult
            .Where(dr => dr.User == user)
            .ToArray();

        if (dailyResults.Length > 0)
        {
            _context.DailyResult.RemoveRange(dailyResults);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{user}/{dateString}")]
    public IActionResult Delete([FromRoute] string user, [FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var dailyResults = _context.DailyResult
            .Where(dr => dr.User == user && dr.Date == date.Date)
            .ToArray();

        if (dailyResults.Length > 0)
        {
            _context.DailyResult.RemoveRange(dailyResults);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpPut("{user}")]
    public IActionResult Set([FromRoute] string user, [FromBody] string result)
    {
        return CreateDailyResult(user, TimeUtility.GetNowEasternStandardTime().Date, result);
    }

    [HttpPut("{user}/{dateString}")]
    public IActionResult Set([FromRoute] string user, [FromRoute] string dateString, [FromBody] string result)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        return CreateDailyResult(user, date, result);
    }

    private IActionResult CreateDailyResult(string user, DateTime date, string result) {
        DailyResult? dailyResult = null;
        foreach (var parser in _resultParsers)
        {
            if (parser.TryParse(user, date, result, out dailyResult))
            {
                break;
            }
        }

        if (dailyResult == null)
        {
            return BadRequest("The game results could not be parsed");
        }

        var existingResult = _context.DailyResult.SingleOrDefault(dr => dr.User == dailyResult.User && dr.Date.Date == dailyResult.Date.Date && dr.Game == dailyResult.Game);
        if (existingResult != null)
        {
            _context.Entry(existingResult).State = EntityState.Detached;
            dailyResult.Id = existingResult.Id;
            _context.DailyResult.Attach(dailyResult);
            _context.Entry(dailyResult).State = EntityState.Modified;
        }
        else
        {
            _context.DailyResult.Add(dailyResult);
        }

        _context.SaveChanges();

        return NoContent();
    }
}
