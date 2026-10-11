<?php
namespace App\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
final class HomeController
{
    #[Route('/', name: 'home', methods: ['GET'])]
    public function index(): Response
    {
        $time = (new \DateTimeImmutable('now', new \DateTimeZone('Europe/Riga')))->format('Y-m-d H:i:s T');
        return new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PHP Symfony Coursework</title><style>body{max-width:760px;margin:70px auto;padding:24px;font:18px/1.6 system-ui;background:#f5f3ff;color:#242742}article{background:white;border-radius:20px;padding:32px}</style><article><h1>Campus Event Planner: PHP exercise</h1><p>Symfony 7.4 application is running.</p><p>Task 3 integration status: the PHPJunkyard RanTex download is pending its website confirmation. No third-party script has been integrated yet.</p><footer>Copyright &copy; '.substr($time,0,4).' Voroncovs Artjoms · '.$time.'</footer></article></html>');
    }
}
