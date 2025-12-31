<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
class AuditController extends Controller
{
    public function index() {
        return Inertia::render('admin/settings/index', [
            'audits' => \OwenIt\Auditing\Models\Audit::with('user')->latest()->take(100)->get(),
            'currentTab' => 'audits'
        ]);
    }
}
