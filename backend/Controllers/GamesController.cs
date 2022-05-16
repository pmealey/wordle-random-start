using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class GamesController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<GamesController> _logger;
    private readonly IEnumerable<ResultParser> _resultParsers;
 
    public GamesController(DataContext context, ILogger<GamesController> logger, IEnumerable<ResultParser> resultParsers)
    {
        _context = context;
        _logger = logger;
        _resultParsers = resultParsers;
    }

    [HttpGet()]
    public IActionResult Get()
    {
        var games = _resultParsers
            .Select(rp => new {
                CountWinner = rp.CountWinner,
                GameName = rp.GameName,
                GolfScoring = rp.GolfScoring,
                HelpText = rp.HelpText,
                Url = rp.Url
            })
            .ToList();

        return Ok(games);
    }
}
